import { parseString as xmlParser } from 'xml2js';
import tabParser from 'csv-parse';
import { ResultsObj } from './types/MWSSimple.d';

const processXmlRequest = (
    body: string,
    callback: (err: Error | null, result: any) => void,
) => xmlParser(body, (err, result) => callback(err, result));

const processTextRequest = (body: string, callback: (err: Error | null, result: any) => void) => {
    if (typeof body === 'string' && (body.indexOf('\t') === -1 || body.startsWith('Feed Processing Summary'))) {
        callback(undefined, body);
    } else {
        tabParser(body, { delimiter: '\t', columns: true, relax: true }, (err, result) => callback(err, result));
    }
};

const processRequest = (
    { contentType, body }: ResultsObj,
    callback: (err: Error | null, result: any) => void,
) => {
    if (contentType.includes('/xml')) processXmlRequest(body, callback);
    else if (contentType.includes('text/plain')) {
        processTextRequest(body, callback);
    } else {
        console.warn('**** mws-simple: unknown content-type', contentType);
        callback(undefined, body);
    }
};

export { processRequest, processXmlRequest, processTextRequest };
export default processRequest;
