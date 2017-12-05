'use strict';
let crypto = require('crypto');
let request = require('request');
let xmlParser = require('xml2js').parseString;
let tabParser = require('csv-parse');
let qs = require('query-string');
let packageInfo = require('./package.json');

// Client is the class constructor
module.exports = Client;

// Used for User-Agent header
let appId = packageInfo.name; // name from file: ex. mws-simple
let appVersionId = packageInfo.version; // version from file: ex. 1.0.4

function Client(opts) {
  // force 'new' constructor
  if (!(this instanceof Client)) return new Client(opts);

  this.appId = opts && opts.appId || appId;
  this.appVersionId = opts && opts.appVersionId || appVersionId;

  this.host = opts && opts.host || 'mws.amazonservices.com';
  this.port = opts && opts.port || 443

  if (opts && opts.accessKeyId) this.accessKeyId = opts.accessKeyId;
  if (opts && opts.secretAccessKey) this.secretAccessKey = opts.secretAccessKey;
  if (opts && opts.merchantId) this.merchantId = opts.merchantId;
  if (opts && opts.authToken) this.authToken = opts.authToken;
}

// http://docs.developer.amazonservices.com/en_US/dev_guide/DG_ClientLibraries.html
Client.prototype.request = function(requestData, callback) {
  // Try to allow all assumptions to be overriden by caller if needed
  if (!requestData.path) {
    requestData.path = '/';
  }
  if (!requestData.query.Timestamp) {
    requestData.query.Timestamp = (new Date()).toISOString();
  }
  if (!requestData.query.AWSAccessKeyId) {
    requestData.query.AWSAccessKeyId = this.accessKeyId;
  }
  if (!requestData.query.SellerId) {
    requestData.query.SellerId = this.merchantId;
  }
  if (!requestData.responseFormat) {
    requestData.responseFormat = 'xml';
  }
  if (!requestData.query.MWSAuthToken && this.authToken) {
    requestData.query.MWSAuthToken = this.authToken;
  }

  // Create the Canonicalized Query String
  requestData.query.SignatureMethod = 'HmacSHA256';
  requestData.query.SignatureVersion = '2';
  // qs.stringify will sort the keys and url encode
  let stringToSign = ["POST", this.host, requestData.path, qs.stringify(requestData.query)].join('\n');
  requestData.query.Signature = crypto.createHmac('sha256', this.secretAccessKey).update(stringToSign).digest('base64');

  let options = {
    url: 'https://' + this.host + ':' + this.port + requestData.path,
    headers: {
      Host: this.host,
    },
    form: requestData.query,
  }

  // Use specified User-Agent or assume one
  // http://docs.developer.amazonservices.com/en_US/dev_guide/DG_ClientLibraries.html (Creating the User-Agent header)
  options.headers['User-Agent'] = requestData.headers && requestData.headers['User-Agent'] || this.appId + '/' + this.appVersionId + ' (Language=JavaScript)';

  // Use specified Content-Type or assume one
  if (requestData.headers && requestData.headers['Content-Type']) {
    options.headers['Content-Type'] = requestData.headers['Content-Type'];
  } else if (requestData.feedContent) {
    if (requestData.feedContent.slice(0, 5) === '<?xml') {
      options.headers['Content-Type'] = 'text/xml';
    } else {
      options.headers['Content-Type'] = 'text/tab-separated-values; charset=iso-8859-1';
    }
  } else {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
  }

  // Add body content if any
  if (requestData.feedContent) {
    options.body = requestData.feedContent;
    options.headers['Content-MD5'] = crypto.createHash('md5').update(requestData.feedContent).digest('base64');
  }

  // Make call to MWS
  request.post(options, function (error, response, body) {
    if (error) return callback(error instanceof Error ? error : new Error(error));
    if (response.statusCode < 200 || response.statusCode > 299) {
      return callback(new Error(response.statusCode + ' ' + response.statusMessage + ' ' + response.body));
    }
    // console.warn('**** content-type', response.headers['content-type']);

    let contentType = response.headers.hasOwnProperty('content-type') && response.headers['content-type'];

    if (contentType.indexOf('/xml') !== -1) {
      xmlParser(body, function(err, result) { callback(err, result); });
    } else if (contentType === 'text/plain') {
      // Feed Processing Summaries are pure text data, not tab-delimited
      if (typeof body === 'string' && body.startsWith('Feed Processing Summary')) {
        callback(undefined, body);
      } else {
        // TODO: perhaps we should actually search for tabs before passing it to tab parser...
        tabParser(body, {
          delimiter: '\t',
          columns: true,
          relax: true
        }, callback);
      }
    }
    else {
      console.warn('**** mws-simple: unknown content-type', contentType);
      callback(undefined, body);
    }
  });
};
