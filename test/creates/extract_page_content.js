require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Create - extract_page_content', () => {
  zapier.tools.env.inject();

  it('should get an array', async () => {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN,
      },

      inputData: {
        page_id: 171081838,
        site_id: 'c74b7111-8d83-4833-8b36-dcebb57fae89'
      },
    };

    const results = await appTester(
      App.creates['extract_page_content'].operation.perform,
      bundle
    );
    results.should.be.a.Object();
    // let page = results.page;
    // page.should.has.property('id');
    //results.attachments.should.be.an.Array();
  });
});
