const hydrators = require("../hydrators.js");
const error = require("../shared/errors/errors.js");
const { JiraService } = require("../shared/services/jiraService.js");
const stringHelper = require("../shared/helpers/string_helper.js");
const he = require("he");
const CustomError = error.customError;

const perform = async (z, bundle) => {
  const siteId = bundle.inputData.site_id.split(" ")[0].trim();

  const jriaService = new JiraService(z, bundle.authData.access_token, siteId);

  const fetchIssueRequest = (key, field_ids) => {
    return jriaService.getIssue({
      issueKey: key,
      fields: field_ids.join(","),
      expand: "renderedFields",
    });
  }

  const processAttachments = (attachments) => {
    return attachments.map((obj) => {
      obj.stashedUrl = z.dehydrateFile(hydrators.downloadFileWithAuth, {
        fileUrl: obj.url,
        access_token: bundle.authData.access_token,
      });
      return obj;
    });
  }

  const processDescription = (input) => {
    let trimText = stringHelper.stripHtmlTags(input).trim();
    return he.decode(trimText);
  }

  const fetchIssue = async (key, field_ids) => {
    let issue = await fetchIssueRequest(key, field_ids).then((res) => {
      let account_field_id = field_ids.find((x) => x.includes("customfield_"));
      if (res.fields[account_field_id] == null) {
        error.throwError(z, new CustomError(301));
        return null;
      }
      return {
        descriptionText: res.renderedFields.description,
        accounts: res.fields[account_field_id].map((x) => {
          let splits = x.value.split("-");
          return {
            accountType: splits[0].trim(),
            accountName: splits[1].trim(),
          };
        }),
        attachments: res.fields["attachment"].map((x) => {
          return {
            id: x.id,
            name: x.filename,
            mimeType: x.mimeType,
            url: x.content,
            hubspotUrl: `https://24400165.fs1.hubspotusercontent-na1.net/hubfs/24400165/${encodeURIComponent(
              "Social posts"
            )}/${encodeURIComponent(key)}/${encodeURIComponent(x.filename)}`,
          };
        }),
      };
    });
    return issue;
  };

  const handleError = (issue) => {
    if (issue == null) {
        error.throwError(z, new CustomError(300));
      }
      if (issue.descriptionText == null) {
        error.throwError(z, new CustomError(303));
      }
      if (issue.attachments.length > 4) {
        error.throwError(z, new CustomError(304));
      }
  }

  const main = async () => {
    let isNum = /^\d+$/.test(bundle.inputData.account_field_id);
    if (!isNum) {
      error.throwError(z, new CustomError(302));
    }
    let field_ids = [
      "description",
      "attachment",
      `customfield_${bundle.inputData.account_field_id}`,
    ];
    const issue = await fetchIssue(bundle.inputData.issue_key, field_ids);

    handleError(issue)

    issue.descriptionText = processDescription(issue.descriptionText);

    processAttachments(issue.attachments);

    let data = {
      token: bundle.authData.access_token,
      issue,
    };
    z.console.log(data);
    return data;
  }

  return main();
};

module.exports = {
  key: "extract_issue_content",
  noun: "Content and Attachments",
  display: {
    label: "Extract Issue Contents",
    description:
      "Find JIRA issue from ID. Then extract issue content and attachments (if any)",
    hidden: false,
    important: true,
  },
  operation: {
    inputFields: [
      {
        key: "issue_key",
        label: "Issue Key",
        type: "string",
        helpText:
          "JIRA issue ID to be extract content and attachments from. The format should be KEY-xyz",
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
      {
        key: "account_field_id",
        label: "'Accounts' Custom field ID",
        type: "string",
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
  },
};
