import axios from 'axios';
import crypto from 'crypto';
import qs from 'querystring';
import fs from 'fs';
import mimetypes from 'mimetypes';
import moment from 'moment';
// Constants
const P_APPKEY = "app_key";
const P_API = "method";
const P_ACCESS_TOKEN = "access_token";
const P_VERSION = "v";
const P_FORMAT = "format";
const P_TIMESTAMP = "timestamp";
const P_SIGN = "sign";
const P_JSON_PARAM_KEY = "360buy_param_json";

const P_CODE = 'code';
const P_SUB_CODE = 'sub_code';
const P_MSG = 'msg';
const P_SUB_MSG = 'sub_msg';

const N_REST = '/routerjson';

// Sign function (MD5 hash)
function sign(secret, parameters) {
  let strParameters = "";
  const keys = Object.keys(parameters).sort();
  strParameters = `${secret}${keys.map(key => `${key}${parameters[key]}`).join('')}${secret}`;
  
  const hash = crypto.createHash('md5');
  hash.update(strParameters, 'latin1');
  return hash.digest('hex').toUpperCase();
}

// Mix String function
function mixStr(pstr) {
  if (typeof pstr === 'string') return pstr;
  if (Buffer.isBuffer(pstr)) return pstr.toString('utf-8');
  return String(pstr);
}

// FileItem class for file handling
class FileItem {
  constructor(filename = null, content = null) {
    this.filename = filename;
    this.content = content;
  }
}

// MultiPartForm class for handling form data with files
class MultiPartForm {
  constructor() {
    this.formFields = [];
    this.files = [];
    this.boundary = "PYTHON_SDK_BOUNDARY";
  }

  getContentType() {
    return `multipart/form-data; boundary=${this.boundary}`;
  }

  addField(name, value) {
    this.formFields.push([name, String(value)]);
  }

  addFile(fieldName, filename, fileHandle, mimetype = null) {
    const body = fs.readFileSync(fileHandle);
    if (!mimetype) {
      mimetypes.lookup(filename) || 'application/octet-stream';
    }
    this.files.push([mixStr(fieldName), mixStr(filename), mixStr(mimetype), body]);
  }

  toString() {
    const parts = [];
    const partBoundary = `--${this.boundary}`;

    // Add form fields
    this.formFields.forEach(([name, value]) => {
      parts.push(`${partBoundary}\r\nContent-Disposition: form-data; name="${name}"\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${value}`);
    });

    // Add files
    this.files.forEach(([fieldName, filename, contentType, body]) => {
      parts.push(`${partBoundary}\r\nContent-Disposition: file; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\nContent-Transfer-Encoding: binary\r\n\r\n${body}`);
    });

    parts.push(`--${this.boundary}--\r\n`);
    return parts.join('\r\n');
  }
}

// Custom Error for JD API Exceptions
class JdException extends Error {
  constructor(errorcode, message, subcode, submsg, application_host, service_host) {
    super(message);
    this.errorcode = errorcode;
    this.message = message;
    this.subcode = subcode;
    this.submsg = submsg;
    this.application_host = application_host;
    this.service_host = service_host;
  }

  toString() {
    return `errorcode=${mixStr(this.errorcode)} message=${mixStr(this.message)} subcode=${mixStr(this.subcode)} submsg=${mixStr(this.submsg)} application_host=${mixStr(this.application_host)} service_host=${mixStr(this.service_host)}`;
  }
}

// Custom Error for Request Failures
class RequestException extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }

  toString() {
    return `Request failed with status code ${this.statusCode}: ${this.message}`;
  }
}

// RestApi class for interacting with the JD API
class RestApi {
  constructor(domain, port = 80) {
    this.__domain = domain;
    this.__port = port;
    this.__httpmethod = "POST";
    this.__app_key = "app_key";  // Replace with actual app_key
    this.__secret = "app_secret";  // Replace with actual app_secret
  }

  get_request_header() {
    return {
      'Content-type': 'application/x-www-form-urlencoded',
      "Cache-Control": "no-cache",
      "Connection": "Keep-Alive",
    };
  }

  set_app_info(appinfo) {
    this.__app_key = appinfo.appkey;
    this.__secret = appinfo.secret;
  }

  getApiName() {
    return "";
  }

  getVersion() {
    return '2.0';
  }

  getMultipartParas() {
    return [];
  }

  getTranslateParas() {
    return {};
  }

  _check_request() {}

  process_with_url_before_request(url) {}

  async getResponse(access_token = null, version = null, timeout = 30000, ssl = false) {
    const sys_parameters = {
      [P_APPKEY]: this.__app_key,
      [P_VERSION]: version || this.getVersion(),
      [P_API]: this.getApiName(),
      [P_TIMESTAMP]: moment().format('YYYY-MM-DD HH:mm:ss.SSSZ'),
    };

    if (access_token) sys_parameters[P_ACCESS_TOKEN] = access_token;

    let urlString = this.__domain.startsWith('http') ? this.__domain : (ssl ? 'https://' : 'http://') + this.__domain;
    if (!urlString.endsWith(N_REST)) {
      urlString += N_REST;
    }

    this.process_with_url_before_request(urlString);

    const application_parameter = this.getApplicationParameters();
    sys_parameters[P_JSON_PARAM_KEY] = JSON.stringify(application_parameter, null, 2);
    sys_parameters[P_SIGN] = sign(this.__secret, sys_parameters);
    let response;
    try {
      if (this.__httpmethod === 'POST') {
        response = await axios.post(urlString, qs.stringify(sys_parameters), { timeout });
      } else {
        response = await axios.get(urlString, { params: sys_parameters, timeout });
      }
    } catch (err) {
      console.log(err)
    }

    return response.data;
  }

  getApplicationParameters() {
    const application_parameter = {};
    for (const [key, value] of Object.entries(this)) {
      if (!key.startsWith("__") && value != null) {
        application_parameter[key] = value;
      }
    }

    const translate_parameter = this.getTranslateParas();
    for (const [key, value] of Object.entries(application_parameter)) {
      if (translate_parameter[key]) {
        application_parameter[translate_parameter[key]] = value;
        delete application_parameter[key];
      }
    }

    return application_parameter;
  }
}

class appinfo{
    constructor(appkey, secret){
        this.appkey = appkey
        this.secret = secret
    }
}

// Subclass for UnionOpenGoodsCombinationpageGetRequest
class UnionOpenGoodsCombinationpageGetRequest extends RestApi {
    constructor(domain = 'gw.api.360buy.com', port = 80) {
      super(domain, port);
      this.combinationGoodsPageReq = null;  // This will hold the request parameters
    }
  
    getApiName() {
      return 'jd.union.open.goods.combinationpage.get';
    }
  
    // Version for this API request
    getVersion() {
      return '1.0';
    }
  }
  
  // Class for request parameters (CombinationGoodsPageReq)
  class CombinationGoodsPageReq {
    constructor() {
      this.skuInfo = null;  // SKU information (e.g., itemId, quantity)
      this.couponUrls = null;  // List of coupon URLs
      this.activityUrls = null;  // List of activity URLs
    }
  }
  // Subclass for UnionOpenGoodsRankQueryRequest
class UnionOpenGoodsRankQueryRequest extends RestApi {
    constructor(domain = 'gw.api.360buy.com', port = 80) {
      super(domain, port);
      this.RankGoodsReq = null;  // This will hold the request parameters
    }
  
    getApiName() {
      return 'jd.union.open.goods.rank.query';
    }
  
    // Version for this API request
    getVersion() {
      return '1.0';
    }
  }
  
  // Class for request parameters (RankGoodsReq)
  class RankGoodsReq {
    constructor() {
      this.rankId = null;  // Rank ID
      this.sortType = null;  // Sort type (e.g., ascending, descending)
      this.pageIndex = null;  // Page index (pagination)
      this.pageSize = null;  // Page size (number of results per page)
    }
  }
  
export {
  FileItem,
  MultiPartForm,
  JdException,
  RequestException,
  RestApi,
  UnionOpenGoodsCombinationpageGetRequest,
  CombinationGoodsPageReq,
  UnionOpenGoodsRankQueryRequest,
  RankGoodsReq,
  appinfo
};


