class BaseService {
  constructor(z) {
    this.headers = {};
    this.request = z.request;
    this.console = z.console;
  }

  handleResponseSuccess(resp) {
    return resp.data;
  }

  handleResponseFailed(resp) {
    const response = resp.response;
    this.console.log(response.status, response.data);
    throw new InternalServerErrorException();
  }

  async callApi({ url, method = "GET", params, data }) {
    try {
      const resp = await z.request({
        url: url,
        method: method,
        headers: this.headers,
        params: params,
        data: data,
      });

      return this.handleResponseSuccess(resp);
    } catch (e) {
      const error = e;
      this.handleResponseFailed(error);
    }
  }

  get(config) {
    return this.request({ ...config, method: "GET" });
  }
}

module.exports = {
  BaseService,
};
