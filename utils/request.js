const API_BASE_URL = "";

function request(options) {
  const { url, method = "GET", data, header = {} } = options;

  if (!API_BASE_URL) {
    return Promise.reject(new Error("API base URL is not configured"));
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        "content-type": "application/json",
        ...header
      },
      success(response) {
        const { statusCode, data: responseData } = response;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(responseData);
          return;
        }
        reject(new Error(responseData && responseData.message ? responseData.message : "请求失败"));
      },
      fail(error) {
        reject(error);
      }
    });
  });
}

module.exports = {
  request
};
