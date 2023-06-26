const authentication = require('./authentication');
const fetchSiteIdTrigger = require('./triggers/fetch_site_id.js');
const extractPageContentCreate = require('./creates/extract_page_content.js');
const extractIssueContentCreate = require('./creates/extract_issue_content.js');
const hydrators = require('./hydrators.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  hydrators,
  authentication: authentication,
  creates: { 
    [extractPageContentCreate.key]: extractPageContentCreate,
    [extractIssueContentCreate.key]: extractIssueContentCreate,
   },
  triggers: { [fetchSiteIdTrigger.key]: fetchSiteIdTrigger },
};
