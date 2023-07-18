const he = require("he");
const hydrators = require("../hydrators.js");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const error = require("../errors/errors.js");
const {
  ConfluenceService,
} = require("../shared/services/confluenceService.js");
const CustomError = error.customError;
const FieldRequiredError = error.fieldRequiredError;
const imageHelper = require("../helpers/image_helper.js");
const tableHelper = require("../helpers/table_helper.js");
const videoHelper = require("../helpers/video_helper.js");

const perform = async (z, bundle) => {
  function options(preserveOrder) {
    return {
      ignoreAttributes: false,
      preserveOrder: preserveOrder,
      allowBooleanAttributes: true,
      alwaysCreateTextNode: true,
      trimValues: false,
    };
  }

  const site_id = bundle.inputData.site_id.split(" ")[0].trim();
  const baseUrl = `https://api.atlassian.com/ex/confluence/${site_id}`;

  const confluenceService = new ConfluenceService(
    z,
    bundle.authData.access_token,
    siteId
  );

  function fetchPagePropertiesRequest(id) {
    return confluenceService.getPageProperties({
      pageId: id,
    });
  }

  function fetchLabelsRequest(id) {
    return confluenceService.getPageLabels({
      pageId: id,
    });
  }

  const fetchAttachmentsRequest = (id) => {
    return confluenceService.getAttachments({
      pageId: id,
    });
  };

  const fetchChildPagesRequest = (id) => {
    return confluenceService.getChildPages({
      pageId: id,
    });
  };

  const fetchPage = (id) => {
    return confluenceService.getPage({
      pageId: id,
      params: {
        "body-format": "storage",
      },
    });
  };

  const fetchPageProperties = (id) => {
    return fetchPagePropertiesRequest(id).then((response) => {
      const results = response.results;
      return results.map((x) => {
        return {
          value: x.value,
          key: x.key,
        };
      });
    });
  };

  const fetchLabelsInPage = (id) => {
    return fetchLabelsRequest(id).then((response) => {
      const results = response.results;
      return results.length == 0 ? [] : results.map((x) => x.name);
    });
  };

  const fetchAttachments = () => {
    return fetchAttachmentsRequest(bundle.inputData.page_id).then(
      (response) => {
        const results = response;

        // You can do any parsing you need for results here before returning them
        const attachmentObjects = results.results.map((x) => {
          return {
            id: x.id,
            fileId: x.fileId,
            title: x.title,
            url: `${baseUrl}/wiki/rest/api/content/${bundle.inputData.page_id}/child/attachment/${x.id}/download`,
          };
        });

        return attachmentObjects.map((obj) => {
          obj.stashedUrl = z.dehydrateFile(hydrators.downloadFileWithAuth, {
            fileUrl: obj.url,
            access_token: bundle.authData.access_token,
          });
          return obj;
        });
      }
    );
  };

  const fetchHubSpotAdditionalDataPage = () => {
    return fetchChildPagesRequest(bundle.inputData.page_id)
      .then((response) => {
        const results = response;
        return results.results.find((x) => x.title.includes("HubSpot")).id;
      })
      .then((id) => fetchPageRequest(id));
  };

  function parseXml(pageContent, preserveOrder) {
    const parser = new XMLParser(options(preserveOrder));
    return parser.parse(pageContent);
  }

  function processPageContent(folderName, pageContent, attachments) {
    const xmlElements = parseXml(pageContent, true);
    // z.console.log(xmlElements.filter(x => x['h4'] != null)[0]['h4'][0]['strong']);
    tableHelper.addTHeadToTables(xmlElements);
    imageHelper.replaceAcImages(folderName, xmlElements, attachments);
    imageHelper.replaceAcEmoticons(folderName, xmlElements, attachments);
    videoHelper.replaceEmbeddedVideos(xmlElements);

    const builder = new XMLBuilder(options(true));
    let newXml = builder.build(xmlElements);
    z.console.log(newXml);

    return newXml;
  }

  function processHubSpotPageContent(pageContent) {
    const xmlElements = parseXml(pageContent, false);
    var result = {};
    let allRows =
      xmlElements["ac:structured-macro"]["ac:rich-text-body"]["table"]["tbody"][
        "tr"
      ];
    allRows.forEach((row) => {
      let key = row["th"]["p"]["strong"]["#text"];
      let value = row["td"]["p"]["#text"];
      result[camelize(key)] = value;
    });
    return result;
  }

  function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  async function fetchData() {
    const issueKey = bundle.inputData.issue_key;

    const page = await fetchPage(bundle.inputData.page_id);
    const decodedPageContent = he.decode(page.body.storage.value);

    const pageProperties = await fetchPageProperties(bundle.inputData.page_id);
    let coverPicture = pageProperties.find(
      (x) => x.key == "cover-picture-id-published"
    );
    if (coverPicture == null) {
      error.throwError(z, new CustomError(100));
      return;
    }

    const attachments = await fetchAttachments();
    let coverPictureAsAttachment = attachments.find(
      (x) => x.fileId == JSON.parse(coverPicture.value).id
    );
    if (coverPictureAsAttachment == null) {
      error.throwError(z, new CustomError(101));
      return;
    }

    const labels = await fetchLabelsInPage(bundle.inputData.page_id);

    const hubSpotPage = await fetchHubSpotAdditionalDataPage();
    const decodedHubSpotPageContent = he.decode(hubSpotPage.body.storage.value);

    let processedContent = processPageContent(
      issueKey,
      decodedPageContent,
      attachments
    );

    let processedHubSpotPageContent = processHubSpotPageContent(
      decodedHubSpotPageContent
    );

    if (processedHubSpotPageContent.metaDescription == null) {
      error.throwError(z, new FieldRequiredError("Meta Description"));
      return;
    }

    if (processedHubSpotPageContent.slug == null) {
      error.throwError(z, new FieldRequiredError("Slug"));
      return;
    }

    if (processedHubSpotPageContent.featuredImageAltText == null) {
      error.throwError(z, new FieldRequiredError("Featured Image Alt Text"));
      return;
    }

    let coverPictureUrl = imageHelper.generateHubSpotImageUrl(
      issueKey,
      coverPictureAsAttachment.title
    );
    let data = {
      // access_token: bundle.authData.access_token,
      page,
      labels,
      attachments,
      // TODO: remove hard-code
      coverPicture: coverPictureUrl,
      processedContent: processedContent,
      processedHubSpotPageContent: processedHubSpotPageContent,
    };
    // z.console.log(data);
    return data;
  }

  return fetchData();
};

module.exports = {
  key: "extract_page_content",
  noun: "Content and Attachments",
  display: {
    label: "Extract Page Contents",
    description:
      "Find Confluence page from ID. Then extract content and attachments (if any) of this page",
    hidden: false,
    important: true,
  },
  operation: {
    inputFields: [
      {
        key: "issue_key",
        label: "JIRA Issue key",
        type: "string",
        helpText: "Key of JIRA issue, usually in format PROJ-123",
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: "page_id",
        label: "Page ID",
        type: "string",
        helpText:
          "Confluence Page ID to be extract content and attachments from",
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: "site_id",
        label: "Atlassian Site ID",
        type: "string",
        dynamic: "fetch_site_id.id.url",
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
  },
};
