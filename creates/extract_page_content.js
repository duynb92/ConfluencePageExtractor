const hydrators = require('../hydrators.js');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const error = require('../errors/errors.js');
const CustomError = error.customError;

const perform = async (z, bundle) => {
  function options(preserveOrder) {
    return {
      ignoreAttributes: false,
      preserveOrder: preserveOrder,
      allowBooleanAttributes: true,
      alwaysCreateTextNode: true
    };
  };

  const baseUrl = `https://api.atlassian.com/ex/confluence/${bundle.inputData.site_id}`;

  function fetchPageRequest(id) {
    return z.request({
      url: `${baseUrl}/wiki/api/v2/pages/${id}`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.access_token}`,
      },
      params: {
        'body-format': 'storage',
      }
    }
    )
  };

  function fetchPagePropertiesRequest(id) {
    return z.request({
      url: `${baseUrl}/wiki/api/v2/pages/${id}/properties`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.access_token}`,
      }
    })
  };

  function fetchLabelsRequest(id) {
    return z.request({
      url: `${baseUrl}/wiki/api/v2/pages/${id}/labels`,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.access_token}`,
      },
      params: {
        'limit': 100,
      }
    }
    )
  };

  const fetchChildPagesRequest = {
    url: `${baseUrl}/wiki/api/v2/pages/${bundle.inputData.page_id}/children`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
    params: {},
  };

  const fetchAttachmentsRequest = {
    url: `${baseUrl}/wiki/api/v2/pages/${bundle.inputData.page_id}/attachments`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
    params: {},
  };

  const fetchPage = (id) => {
    return fetchPageRequest(id)
      .then((response) => {
        response.throwForStatus();
        const results = response.json;
        return results;
      });
  };

  const fetchPageProperties = (id) => {
    return fetchPagePropertiesRequest(id)
      .then((response) => {
        response.throwForStatus();
        const results = response.json.results;
        return results.map(x => {
          return {
            value: x.value,
            key: x.key
          }
        });
      });
  };

  const fetchLabelsInPage = (id) => {
    return fetchLabelsRequest(id)
      .then((response) => {
        response.throwForStatus();
        const results = response.json.results;
        return results.length == 0 ? [] : results.map(x => x.name);
      });
  };

  const fetchAttachments = () => {
    return z.request(fetchAttachmentsRequest).then((response) => {
      response.throwForStatus();
      const results = response.json;

      // You can do any parsing you need for results here before returning them
      const attachmentObjects = results.results
        .map(
          (x) => {
            return {
              id: x.id,
              fileId: x.fileId,
              title: x.title,
              url: `${baseUrl}/wiki/rest/api/content/${bundle.inputData.page_id}/child/attachment/${x.id}/download`
            }
          }
        );

      return attachmentObjects.map((obj) => {
        obj.stashedUrl = z.dehydrateFile(hydrators.downloadFileWithAuth, {
          fileUrl: obj.url,
          access_token: bundle.authData.access_token
        });
        return obj;
      });
    });
  };

  const fetchHubSpotAdditionalDataPage = () => {
    return z.request(fetchChildPagesRequest)
      .then((response) => {
        response.throwForStatus();
        const results = response.json;
        return results.results.find(x => x.title.includes('HubSpot')).id;
      })
      .then(id => fetchPageRequest(id))
      .then((response) => {
        response.throwForStatus();
        const results = response.json;
        return results;
      })
      ;
  };

  function replaceAcImages(folderName, xmlElements, acImages, attachments) {
    acImages.forEach(element => {
      z.console.log(element);
      let attachmentAttributes = element['ac:image'][0][':@'];
      let imageAttributes = element[':@'];
      let fileName = attachmentAttributes['@_ri:filename'];
      // TODO: how to remove hard-code?
      let url = `https://24400165.fs1.hubspotusercontent-na1.net/hubfs/24400165/Blogs/${folderName}/${fileName}`
      let attachmentId = attachments.find(x => x.title == fileName).id;
      let width = imageAttributes['@_ac:width'] ? imageAttributes['@_ac:width'] : imageAttributes['@_ac:original-width'];
      let height = imageAttributes['@_ac:height'] ? imageAttributes['@_ac:height'] : imageAttributes['@_ac:original-height'];
      let altText = imageAttributes['@_ac:alt'] ? imageAttributes['@_ac:alt'] : fileName.replace(/\.[^/.]+$/, "")
      let index = xmlElements.indexOf(element);
      if (index !== -1) {
        xmlElements[index] = {
          'p': [
            {
              'img': [],
              ':@': {
                '@_confluenceAttachmentId': attachmentId,
                '@_src': url,
                '@_alt': altText,
                '@_width': width,
                '@_height': height,
                '@_loading': 'lazy',
                '@_style': `height: auto; max-width: 100%; width: ${width}px;`
              }
            }
          ],
        }
      }
    });
  }

  function addTHeadToTables(xmlElements) {
    const allTables = xmlElements.filter(x => x['table'] != null);
    allTables.forEach(table => {
      let tableElement = table['table'];
      let tBodies = tableElement.find(x => x['tbody'] != null)['tbody'];
      let firstRow = tBodies[0]['tr'];
      let hasHeader = firstRow.find(x => x['th'] != null);
      if (hasHeader) {
        let tHead = { thead: firstRow };
        
        // Insert thead right after colgroup
        let colGroupIndex = tableElement.indexOf(tableElement.find(x => x['colgroup'] != null));
        tableElement.splice(colGroupIndex + 1, 0, tHead);
        
        // Remove first row from tBodies
        tBodies.splice(0, 1);
      }
    });
  }

  function parseXml(pageContent, preserveOrder) {
    const parser = new XMLParser(options(preserveOrder));
    return parser.parse(pageContent);
  }

  function processPageContent(folderName, pageContent, attachments) {
    const xmlElements = parseXml(pageContent, true);
    addTHeadToTables(xmlElements);
    replaceAcImages(folderName, xmlElements, xmlElements.filter(x => x['ac:image'] != null), attachments);

    const builder = new XMLBuilder(options(true));
    let newXml = builder.build(xmlElements);
    // z.console.log(newXml);

    return newXml;
  }

  function processHubSpotPageContent(pageContent) {
    const xmlElements = parseXml(pageContent, false);
    var result = {};
    let allRows = xmlElements['ac:structured-macro']['ac:rich-text-body']['table']['tbody']['tr'];
    allRows.forEach( row => {
      let key = row['th']['p']['strong']['#text'];
      let value = row['td']['p']['#text'];
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
    const page = await fetchPage(bundle.inputData.page_id);

    const pageProperties = await fetchPageProperties(bundle.inputData.page_id);
    let coverPicture = pageProperties.find(x => x.key == 'cover-picture-id-published');
    if (coverPicture == null) {
      error.throwError(z, new CustomError(100))
      return;
    }
    
    const attachments = await fetchAttachments();
    let coverPictureAsAttachment = attachments.find(x => x.fileId == JSON.parse(coverPicture.value).id)
    if (coverPictureAsAttachment == null) {
      error.throwError(z, new CustomError(101))
      return;
    }

    const labels = await fetchLabelsInPage(bundle.inputData.page_id);
    const hubSpotPage = await fetchHubSpotAdditionalDataPage();

    let processedContent = processPageContent(page.title, page.body.storage.value, attachments);

    let processedHubSpotPageContent = processHubSpotPageContent(hubSpotPage.body.storage.value);

    let data = {
      // access_token: bundle.authData.access_token,
      page,
      labels,
      attachments,
      coverPicture: coverPictureAsAttachment.title,
      processedContent: processedContent,
      processedHubSpotPageContent: processedHubSpotPageContent
    };
    z.console.log(data);
    return data;
  }

  return fetchData();
};

module.exports = {
  key: 'extract_page_content',
  noun: 'Content and Attachments',
  display: {
    label: 'Extract Page Contents',
    description:
      'Find Confluence page from ID. Then extract content and attachments (if any) of this page',
    hidden: false,
    important: true,
  },
  operation: {
    inputFields: [
      {
        key: 'page_id',
        label: 'Page ID',
        type: 'string',
        helpText:
          'Confluence Page ID to be extract content and attachments from',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'site_id',
        label: 'Atlassian Site ID',
        type: 'string',
        dynamic: 'fetch_site_id.id.url',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
  },
};
