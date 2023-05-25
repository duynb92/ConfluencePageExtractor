const perform = async (z, bundle) => {
    const baseUrl = `https://api.atlassian.com/ex/jira/${bundle.inputData.site_id}`;

    function fetchIssueRequest(key, field_ids) {
        return z.request({
            url: `${baseUrl}/rest/api/3/issue/${key}`,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${bundle.authData.access_token}`,
            },
            params: {
                fields: field_ids.join()
            }
        }
        )
    };

    const fetchIssue = (key, field_ids) => {
        return fetchIssueRequest(key, field_ids)
            .then(res => {
                res.throwForStatus();
                return res.json;
            })
    }

    async function main() {
        let field_ids = ['description', `${bundle.inputData.account_field_id}`]
        const issue = await fetchIssue(bundle.inputData.issue_key, field_ids);
        if (issue == null) {
            // throw error
        }
        console.log(issue);
        processAttachments(issue.attachment)

        processDescription(issue.description.content)
        return {
            issue
        };
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