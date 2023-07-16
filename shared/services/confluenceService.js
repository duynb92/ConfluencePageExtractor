const { BaseService } = require("./baseService");

class ConfluenceService extends BaseService {
  constructor(z, token, siteId) {
    super(z);
    this.headers = {
      Authorization: `Bearer ${token}`,
    };
    this.host = `https://api.atlassian.com/ex/confluence/${siteId}`;
  }

  buildUrl(route) {
    return `${this.host}/wiki/api/v2/${route}`;
  }

  getPage({ pageId, params }) {
    const url = this.buildUrl(`pages/${pageId}`);
    return this.get({
      url,
      params,
    });
  }

  getPageProperties({ pageId }) {
    const url = this.buildUrl(`pages/${pageId}/properties`);
    return this.get({
      url,
    });
  }

  getPageLabels({ pageId, limit = 100 }) {
    const url = this.buildUrl(`pages/${pageId}/labels`);
    return this.get({
      url,
      params: {
        limit: limit,
      },
    });
  }

  getChildPages({ pageId }) {
    const url = this.buildUrl(`pages/${pageId}/children`);
    return this.get({
      url,
    });
  }

  getAttachments({ pageId }) {
    const url = this.buildUrl(`pages/${pageId}/attachments`);
    return this.get({
      url,
    });
  }

  getAttachmentUrlDownload({ pageId, attachmentId }) {
    return `${this.host}//wiki/rest/api/content/${pageId}/child/attachment/${attachmentId}/download`;
  }
}

module.exports = {
  ConfluenceService,
};
