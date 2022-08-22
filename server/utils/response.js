class Response {
  // using with SUCCESS
  static PAGEABLE (listData = [], totalElement, currentPage = 1, size = 20) {
    return {
      datas: listData,
      pageable: {
        totalElement: totalElement,
        currentElement: listData ? listData.length : 0,
        totalPage: Math.ceil(totalElement / size),
        page: currentPage,
        size: size,
        hasNext: totalElement - ((currentPage - 1) * size + (listData ? listData.length : 0)) > 0
      }
    }
  }

  static SUCCESS (message = '', data = null) {
    return {
      code: 200,
      data: {
        result: true,
        message,
        data
      }
    }
  }

  static ERROR(code = 500, message = '', clientErrCode = null, data = null) {
    return {
      code,
      data: {
        result: false,
        message,
        data,
        errorCode: clientErrCode
      }
    }
  }

  static WARN(code = 400, message = '', clientErrCode = null, data = null) {
    return {
      code,
      data: {
        result: false,
        message,
        data,
        errorCode: clientErrCode
      }
    }
  }

  static NOTFOUND(code = 404, message = '', clientErrCode = null, data = null) {
    return {
      code,
      data: {
        result: false,
        message,
        data,
        errorCode: clientErrCode
      }
    }
  }

  //using for response internal server
  static LOCAL_SUCCESS(data, message = "Ok!"){
    return {
      result: true,
      message,
      data
    }
  }

  static LOCAL_ERROR(errorCode, message, data) {
    return {
      result: false,
      message,
      errorCode: errorCode,
      data
    }
  }

  static RESPONSE_REDIRECT(url, httpStatus = 301){
    return {
      url,
      httpStatus
    }
  }
}

module.exports = Response
