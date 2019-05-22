const request = require('request');
const syncWriteToFile = require('./syncWriteToFile');
const ServerError = require('./ServerError');
const { processRequest } = require('./processRequest');

/* eslint-disable prefer-arrow-callback, consistent-return, max-len, no-console */
module.exports = (options, debug = {}, cb) => {
    request.post(options, function postRequest(error, response, body) {
        function logDataDoCallback(err, result, file, data) {
            if (file) {
                syncWriteToFile(file, data);
            }
            cb(err, { result, headers: response.headers });
        }

        if (debug.rawFile) {
            syncWriteToFile(debug.rawFile, `\nerror= ${error}\nresponse= ${JSON.stringify(response)}\nbody= ${body}\n`);
        }

        if (error) {
            return cb(error instanceof Error ? error : new Error(error), { result: undefined, headers: response && response.headers });
        }
        if (response.statusCode < 200 || response.statusCode > 299) {
            return cb(new ServerError(response.statusMessage, response.statusCode, response.body), { result: undefined, headers: response && response.headers });
        }

        const contentType = Object.prototype.hasOwnProperty.call(response.headers, 'content-type') && response.headers['content-type'];
        processRequest({ contentType, body }, (err, result) => {
            return logDataDoCallback(err, result, debug.parsedFile, `\nerror=${err}\nresult=${JSON.stringify(result)}\n`);
        });
    });
};
