const { BaseService } = require("./baseService");

class JiraService extends BaseService {
  constructor(z, token, siteId) {
    super(z);
    this.headers = {
      Authorization: `Bearer ${token}`,
    };
    this.host = `https://api.atlassian.com/ex/jira/${siteId}`;
  }

  buildUrl(route) {
    return `${this.host}/rest/api/3/${route}`;
  }

  getIssue({ issueKey, fields, expand }) {
    const url = this.buildUrl(`issue/${issueKey}`);
    return this.get({
      url,
      params: {
        fields,
        expand,
      },
    });
  }
}

module.exports = {
  JiraService,
};
