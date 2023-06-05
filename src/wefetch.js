function myfetch(url, options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: options.body,
      method: options.method,
      dataType: 'json',
      header:
        Object.prototype.toString.call(options.headers) == '[object Map]'
          ? Object.fromEntries(options.headers.entries())
          : options.headers,
      success: resolve,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode <= 299) {
          res.ok = true
        } else {
          res.ok = false
        }
        res.headers = new Map(Object.entries(lowerJSONKey(res.header)))
        res.status = res.statusCode
        res.json = function () {
          return new Promise((resolve, reject) => {
            resolve(res.data)
          })
        }
        delete res.header
        delete res.statusCode
        resolve(res)
      },
      fail(err) {
        reject(err)
      },
    })
  })
}

// header小写转换
function lowerJSONKey(jsonObj) {
  for (var key in jsonObj) {
    if (/[A-Z]/.test(key)) {
      jsonObj[key.toLowerCase()] = jsonObj[key]
      delete jsonObj[key]
    }
  }
  return jsonObj
}

export default myfetch
