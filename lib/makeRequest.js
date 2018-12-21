const syncWriteToFile = require('./syncWriteToFile');
const request = require('request');
const { parseString: xmlParser } = require('xml2js');
const tabParser = require('csv-parse');
const ServerError = require('./ServerError');

module.exports = (options, debug = {}, cb) => {
    request.post(options, function (error, response, body) {
        function logDataDoCallback(err, result, file, data) {
            if (file) {
                syncWriteToFile(file, data);
            }
            cb(err, {result: result, headers: response.headers});
        }

        if (debug.rawFile) {
            syncWriteToFile(debug.rawFile, `\nerror= ${error}\nresponse= ${JSON.stringify(response)}\nbody= ${body}\n`);
        }

        if (error) {
            return cb(error instanceof Error ? error : new Error(error), {result: undefined, headers: response && response.headers});
        }
        if (response.statusCode < 200 || response.statusCode > 299) {
            return cb(new ServerError(response.statusMessage, response.statusCode, response.body), {result: undefined, headers: response && response.headers});
        }

        let contentType = response.headers.hasOwnProperty('content-type') && response.headers['content-type'];
        if (contentType.indexOf('/xml') !== -1) {
            xmlParser(body, (err, result) => logDataDoCallback(err, result, debug.parsedFile, `\nerror=${err}\nresult=${JSON.stringify(result)}\n`));
        } else if (contentType.indexOf('text/plain') !== -1) {
            // Feed Processing Summaries are pure text data, not tab-delimited
            if (typeof body === 'string' && (body.indexOf('\t') === -1 || body.startsWith('Feed Processing Summary'))) {
                logDataDoCallback(undefined, body, debug.parsedFile, `\nbody=${body}\n`);
            } else {
                tabParser(body, {
                    delimiter: '\t',
                    columns: true,
                    relax: true
                }, (err, result) => logDataDoCallback(err, result, debug.parsedFile, `\nerror=${err}\nresult=${JSON.stringify(result)}\n`));
            }
        } else {
            console.warn('**** mws-simple: unknown content-type', contentType);
            logDataDoCallback(undefined, body, debug.parsedFile, `\nbody=${body}\n`);
        }
    });
};
