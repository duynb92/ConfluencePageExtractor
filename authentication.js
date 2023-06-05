module.exports = {
  type: 'oauth2',
  test: {
    headers: { Authorization: 'Bearer {{bundle.authData.access_token}}' },
    url: 'https://api.atlassian.com/oauth/token/accessible-resources',
  },
  oauth2Config: {
    authorizeUrl: {
      url: 'https://auth.atlassian.com/authorize',
      params: {
        client_id: '{{process.env.CLIENT_ID}}',
        state: '{{bundle.inputData.state}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        response_type: 'code',
        audience: 'api.atlassian.com',
        prompt: 'consent',
      },
    },
    getAccessToken: {
      body: {
        code: '{{bundle.inputData.code}}',
        client_id: '{{process.env.CLIENT_ID}}',
        client_secret: '{{process.env.CLIENT_SECRET}}',
        grant_type: 'authorization_code',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      method: 'POST',
      url: 'https://auth.atlassian.com/oauth/token',
    },
    refreshAccessToken: {
      body: {
        refresh_token: '{{bundle.authData.refresh_token}}',
        grant_type: 'refresh_token',
        client_id: '{{process.env.CLIENT_ID}}',
        client_secret: '{{process.env.CLIENT_SECRET}}',
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      method: 'POST',
      url: 'https://auth.atlassian.com/oauth/token',
    },
    enablePkce: false,
    autoRefresh: true,
    scope: 'read:page:confluence read:attachment:confluence offline_access read:issue:jira read:attachment:jira',
  },
};
