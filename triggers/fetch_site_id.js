const siteOutputFields = async (z, bundle) => {
  z.console.log("here");
   const response = await z.request({
    url: 'https://api.atlassian.com/oauth/token/accessible-resources',
    method: 'GET',
    headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bundle.authData.access_token}`,
    },
    params: {}
  })
    .then(response => {
      let json = response.json;
      z.console.log(json);
      let result = json.map(x=> {
        let isJira = x.scopes.find(x => x.includes('jira')) != null;
        var id = x.id;
        if (isJira) {
          id = `${id} - jira`
        } else {
          id = `${id} - confluence`
        }

        return {
          id: id,
          url: x.url
        }
      });
      z.console.log(result);
      return result;
    })
    return response;
  };


module.exports = {
  operation: {
    perform: siteOutputFields,
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
      { key: 'url', label: 'url', type: 'string' }
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
