const hydrators = require('../hydrators.js');
const error = require('../errors/errors.js');
const stringHelper = require('../helpers/string_helper.js');
const CustomError = error.customError;

const perform = async (z, bundle) => {
    const site_id = bundle.inputData.site_id.split(" ")[0].trim();
    const baseUrl = `https://api.atlassian.com/ex/jira/${site_id}`;

    function fetchIssueRequest(key, field_ids) {
        return z.request({
            url: `${baseUrl}/rest/api/3/issue/${key}`,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            params: {
                fields: field_ids.join(),
                expand: 'renderedFields'
            }
        })
    };

    function processAttachments(attachments) {
        return attachments.map((obj) => {
            obj.stashedUrl = z.dehydrateFile(hydrators.downloadFileWithAuth, {
              fileUrl: obj.url,
              access_token: bundle.authData.access_token
            });
            return obj;
          });
    }

    function processDescription(input) {
        return JSON.stringify(stringHelper.stripHtmlTags(input))
    }

    const fetchIssue = async (key, field_ids) => {
        let issue = await fetchIssueRequest(key, field_ids)
            .then(res => {
                res.throwForStatus();
                z.console.log(res.json);
                let account_field_id = field_ids.find(x => x.includes('customfield_'));
                if (res.json.fields[account_field_id] == null) {
                    error.throwError(z, new CustomError(301));
                    return null;
                }
                return {
                    descriptionText: res.json.renderedFields.description,
                    accounts: res.json.fields[account_field_id].map(x => {
                        let splits = x.value.split('-');
                        return {
                            accountType: splits[0].trim(),
                            accountName: splits[1].trim()
                        }
                    }),
                    attachments: res.json.fields['attachment'].map(x => {
                        return {
                            url: x.content
                        }
                    })
                }
            });
        return issue;
    }

    async function main() {
        let isNum = /^\d+$/.test(bundle.inputData.account_field_id);
        if (!isNum) {
            error.throwError(z, new CustomError(302))
        }
        let field_ids = ['description', 'attachment', `customfield_${bundle.inputData.account_field_id}`]
        const issue = await fetchIssue(bundle.inputData.issue_key, field_ids);
        console.log(issue);
        if (issue == null) {
            error.throwError(z, new CustomError(300))
        }
        if (issue.descriptionText == null) {
            error.throwError(z, new CustomError(303))
        }
        if (issue.attachments.length > 1) {
            error.throwError(z, new CustomError(304))
        }

        issue.descriptionText = processDescription(issue.descriptionText);

        // Check if content has any hyperlink
        if(stringHelper.checkHyperlinks(issue.descriptionText)) {
            issue.attachments = []
        } else {
            processAttachments(issue.attachments);
        }

        let data = {
            token: bundle.authData.access_token,
            issue
        };
        z.console.log(data);
        return data;
    }
    return main();
};

module.exports = {
    key: 'extract_issue_content',
    noun: 'Content and Attachments',
    display: {
        label: 'Extract Issue Contents',
        description:
            'Find JIRA issue from ID. Then extract issue content and attachments (if any)',
        hidden: false,
        important: true,
    },
    operation: {
        inputFields: [
            {
                key: 'issue_key',
                label: 'Issue Key',
                type: 'string',
                helpText:
                    'JIRA issue ID to be extract content and attachments from. The format should be KEY-xyz',
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
            {
                key: 'account_field_id',
                label: '\'Accounts\' Custom field ID',
                type: 'string',
                required: true,
                list: false,
                altersDynamicFields: false,
            },
        ],
        perform: perform,
    },
};