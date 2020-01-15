import { IncomingHttpHeaders } from 'http';

export interface ConstructorParams {
    appId?: string,
    appVersionId?: string,
    host?: string,
    port?: number,
    accessKeyId?: string,
    secretAccessKey?: string,
    merchantId?: string,
    authToken?: string,
}

export interface DebugOptions {
    rawFile?: string,
    parsedFile?: string,
}

export interface ResultsObj {
    contentType: string,
    body: string,
}
