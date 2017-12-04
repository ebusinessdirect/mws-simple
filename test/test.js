const MWS = require('..');
const chai = require('chai');

const expect = chai.expect;

describe('Sanity', () => {
    it ('true is true', (done) => {
        expect(true).to.equal(true);
        done();
    });
    it ('mws-simple returns a new mws object when called directly', (done) => {
        const mws = MWS({ accessKeyId: 'test', secretAccessKey: 'test', merchantId: 'test' });
        expect(mws).to.be.instanceOf(MWS).and.not.equal(MWS);
        done();
    });
    it ('mws-simple returns a new mws object when instantiated with new', (done) => {
        const mws = new MWS({ accessKeyId: 'test', secretAccessKey: 'test', merchantId: 'test' });
        expect(mws).to.be.instanceOf(MWS).and.not.equal(MWS);
        done();
    });
    it ('mws-simple works when called with no configuration options', (done) => {
        expect(new MWS()).to.be.instanceOf(MWS);
        done();
    });
    it ('mws-simple configures default host and port correctly', (done) => {
        const mws = new MWS({});
        expect(mws).to.include.all.keys(
            'host',
            'port',
        );
        expect(mws.host).to.equal('mws.amazonservices.com');
        expect(mws.port).to.equal(443);
        done();
    });
    it ('new mws object retains the keys it was constructed with', (done) => {
        const mws = new MWS({
            host: 'testHost',
            port: 444,
            accessKeyId: 'accessKey',
            secretAccessKey: 'secretKey',
            merchantId: 'merchantId',
            authToken: 'authToken',
        });
        expect(mws).to.include.all.keys(
            'accessKeyId',
            'secretAccessKey',
            'merchantId',
            'authToken'
        );
        expect(mws.host).to.equal('testHost');
        expect(mws.port).to.equal(444);
        expect(mws.accessKeyId).to.equal('accessKey');
        expect(mws.secretAccessKey).to.equal('secretKey');
        expect(mws.merchantId).to.equal('merchantId');
        expect(mws.authToken).to.equal('authToken');
        done();
    });
    it ('new mws object does not retain keys it doesnt understand', (done) => {
        const mws = new MWS({ testData: 'test' });
        expect(mws.testData).to.be.undefined;
        done();
    });
});

let keys;
try {
    keys = require('./keys.json');
} catch(err) {
}

let SkipAPITests = false;

if (!keys || !keys.accessKeyId || !keys.secretAccessKey || !keys.merchantId) {
    SkipAPITests = true;
}

describe('Requirements to perform API tests', () => {
    if ('a valid keys.json file is in the test directory', (done) => {
        expect(keys,
            'please provide a keys.json file with accessKeyId, secretAccessKey, and merchantId',
        ).to.include.all.keys(
            'accessKeyId',
            'secretAccessKey',
            'merchantId',
        );
        done();
    });
});

describe('API tests', () => {
    let mwsApi = {};
    beforeEach(() => mwsApi = new MWS(keys));
    it('fill in API tests after initial commit', function test() {
        if (SkipAPITests) {
            this.skip();
            return false;
        }
    });
});
