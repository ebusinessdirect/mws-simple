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
    // TODO: test response from bad API call:
    // {"ErrorResponse":{"$":{"xmlns":"https://mws.amazonservices.com/JunkTest/2011-07-01"},"Error":[{"Type":["Sender"],"Code":["InvalidAddress"],"Message":["Operation ListMarketplaces is not available for section Sellers/2011-07-01"]}],"RequestID":["736ecd92-d162-4094-9e33-4bf2d0c6bc9c"]}}
    it('test /Sellers/2011-07-01 ListMarketplaceParticipations', function test(done) {
        if (SkipAPITests) {
            this.skip();
            return false;
        }
        const query = {
            path: '/Sellers/2011-07-01',
            query: {
                Action: 'ListMarketplaceParticipations',
                Version: '2011-07-01',
            },
        };
        mwsApi.request(query, (err, result) => {
            // console.warn('* result=', JSON.stringify(result, null, 4));
            if (err) {
                done(err);
                return false;
            }
            expect(result).to.be.an('object').and.contain.key('ListMarketplaceParticipationsResponse');
            const response = result.ListMarketplaceParticipationsResponse;
            expect(response).to.be.an('object').and.contain.keys(
                '$',
                'ListMarketplaceParticipationsResult',
                'ResponseMetadata',
            );
            expect(response.$.xmlns).to.be.a('string').and.equal('https://mws.amazonservices.com/Sellers/2011-07-01');
            // TODO: we could stand to fill out the tests of received data a little more fully.
            expect(response.ListMarketplaceParticipationsResult).to.be.an('array').with.lengthOf(1);
            expect(response.ResponseMetadata).to.be.an('array').with.lengthOf(1);
            done();
        });
    });
});
