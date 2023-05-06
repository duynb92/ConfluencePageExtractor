module.exports = {
  operation: {
    perform: {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer {{bundle.authData.access_token}}',
      },
      url: 'https://api.atlassian.com/oauth/token/accessible-resources',
    },
    sample: {
      id: 'c74b7111-8d83-4833-8b36-dcebb57fae89',
      url: 'https://agileops.atlassian.net',
      name: 'agileops',
      scopes: ['read:attachment:confluence', 'read:page:confluence'],
      avatarUrl:
        'https://site-admin-avatar-cdn.prod.public.atl-paas.net/avatars/240/rocket.png',
    },
    outputFields: [
      { key: 'id', label: 'id', type: 'string' },
      { key: 'url', label: 'url', type: 'string' },
    ],
  },
  key: 'fetch_site_id',
  noun: 'Site ID',
  display: {
    label: 'Fetch site ID',
    description: 'Fetch site ID for user to select after authentication',
    hidden: true,
    important: false,
  },
};
