const crypto = require('crypto');
const request = require('request');
const xmlParser = require('xml2js').parseString;
const tabParser = require('csv-parse');
const qs = require('query-string');
const packageInfo = require('./package.json');

const { name: pkgAppId, version: pkgAppVersionId } = packageInfo; // pkgAppId=name, pkgAppVersionId=version

function MWSSimple({ appId=pkgAppId, appVersionId=pkgAppVersionId, host='mws.amazonservices.com', port=443, accessKeyId, secretAccessKey, merchantId, authToken }={}) {
    // force 'new' constructor
    if (!(this instanceof MWSSimple)) return new MWSSimple(...arguments);
    const args = { appId, appVersionId, host, port, accessKeyId, secretAccessKey, merchantId, authToken };
    Object.assign(this, args);
}

// http://docs.developer.amazonservices.com/en_US/dev_guide/DG_ClientLibraries.html
MWSSimple.prototype.request = function(requestData, callback) {
  // Try to allow all assumptions to be overriden by caller if needed
    const requestDefaults = {
        path: '/',
        query: {
            Timestamp: (new Date()).toISOString(),
            AWSAccessKeyId: this.accessKeyId,
            SellerId: this.merchantId,
            responseFormat: 'xml',
            MWSAuthToken: this.authToken,
        },
    };
    const newRequestData = {
        ...requestDefaults,
        ...requestData,
        query: {
            ...requestDefaults.query,
            ...requestData.query,
            SignatureMethod: 'HmacSHA256',
            SignatureVersion: '2',
        },
    };

    // Create the Canonicalized Query String
    // qs.stringify will sort the keys and url encode
    const stringToSign = ['POST', this.host, newRequestData.path, qs.stringify(newRequestData.query)].join('\n');
    newRequestData.query.Signature = crypto.createHmac('sha256', this.secretAccessKey).update(stringToSign).digest('base64');

    // Use specified Content-Type or assume one
    let contentType = newRequestData.headers && newRequestData.headers['Content-Type'];
    if (!contentType) {
        if (newRequestData.feedContent) {
            if (newRequestData.feedContent.slice(0, 5) === '<?xml') {
                contentType = 'text/xml';
            } else {
                contentType = 'text/tab-separated-values; charset=iso-8859-1';
            }
        } else {
            contentType = 'application/x-www-form-urlencoded; charset=utf-8';
        }
    }

    const options = {
        url: `https://${this.host}:${this.port}${newRequestData.path}`,
        headers: {
            Host: this.host,
            // http://docs.developer.amazonservices.com/en_US/dev_guide/DG_ClientLibraries.html (Creating the User-Agent header)
            'User-Agent': `${newRequestData.headers && newRequestData.headers['User-Agent'] || this.appId}/${this.appVersionId} (Language=Javascript)`,
            'Content-Type': contentType,
            'Content-MD5': newRequestData.feedContent ? crypto.createHash('md5').update(newRequestData.feedContent).digest('base64') : undefined,
        },
        form: newRequestData.query,
        body: newRequestData.feedContent,
    };

    request.post(options, function (error, response, body) {
        if (error) return callback(error instanceof Error ? error : new Error(error));
        if (response.statusCode < 200 || response.statusCode > 299) {
            return callback(new Error(response.statusCode + ' ' + response.statusMessage + ' ' + response.body));
        }

        let contentType = response.headers.hasOwnProperty('content-type') && response.headers['content-type'];
        if (contentType.indexOf('/xml') !== -1) {
            xmlParser(body, function(err, result) { callback(err, result); });
        } else if (contentType.indexOf('text/plain') !== -1) {
            // Feed Processing Summaries are pure text data, not tab-delimited
            if (typeof body === 'string' && (body.indexOf('\t') === -1 || body.startsWith('Feed Processing Summary'))) {
                callback(undefined, body);
            } else {
                tabParser(body, {
                    delimiter: '\t',
                    columns: true,
                    relax: true
                }, callback);
            }
        } else {
            console.warn('**** mws-simple: unknown content-type', contentType);
            callback(undefined, body);
        }
    });
};

module.exports = MWSSimple;
