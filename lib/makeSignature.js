const qs = require('query-string');
const crypto = require('crypto');

// Create the Canonicalized Query String
// qs.stringify will sort the keys and url encode
module.exports = ({ host, path, query, secretAccessKey }) => {
    const stringToSign = ['POST', host, path, qs.stringify(query)].join('\n');
    return crypto.createHmac('sha256', secretAccessKey).update(stringToSign).digest('base64');
}