const { parseString: xmlParser } = require('xml2js');
const tabParser = require('csv-parse');

const processXmlRequest = (body, callback) => xmlParser(body, (err, result) => callback(err, result));
const processTextRequest = (body, callback) => {
    if (typeof body === 'string' && (body.indexOf('\t') === -1 || body.startsWith('Feed Processing Summary'))) {
        callback(undefined, body);
    } else {
        tabParser(body, { delimiter: '\t', columns: true, relax: true }, (err, result) => callback(err, result));
    }
};
const processRequest = ({ contentType, body }, callback) => {
    if (contentType.includes('/xml')) processXmlRequest(body, callback);
    else if (contentType.includes('text/plain')) {
        processTextRequest(body, callback);
    } else {
        console.warn('**** mws-simple: unknown content-type', contentType);
        callback(undefined, body);
    }
}
module.exports = { processRequest, processXmlRequest, processTextRequest };
