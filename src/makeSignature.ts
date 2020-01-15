import qs from 'query-string';
import crypto from 'crypto';

interface SignatureInput {
    host: string,
    path: string,
    query: { [key: string]: any },
    secretAccessKey: string,
}

// Create the Canonicalized Query String
// qs.stringify will sort the keys and url encode
export default ({
    host,
    path,
    query,
    secretAccessKey,
}: SignatureInput) => {
    const stringToSign = ['POST', host, path, qs.stringify(query)].join('\n');
    return crypto.createHmac('sha256', secretAccessKey).update(stringToSign).digest('base64');
};
