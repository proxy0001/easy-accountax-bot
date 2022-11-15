const { initSheet, addRecord } = require("../utils/sheet.js");
const expect = require("chai").expect;
// load dotenv
require('dotenv').config();

var sheet;

before(async function () {
    const credentials = {
        client_email: process.env.TEST_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.TEST_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
    const docId = process.env.TEST_GOOGLE_DOC_ID;
    const sheetId = process.env.TEST_GOOGLE_SHEET_ID;
    sheet = await initSheet(credentials, docId, sheetId);
});

// a test suite for hanlding google sheet
describe('testing google sheet hanldling',async function () {
    it('should get right sheet title', function () {
        expect(sheet.title).to.equal('test-sheet');
    })

    it('should add new row correctly',async function () {
        const newRow = await addRecord(sheet, {
            title: 'hello',
            amount: 100,
            createDate: '2011',
        });
        expect(newRow.title).to.equal('hello');
        expect(newRow.amount).to.equal('100');
        expect(newRow.createDate).to.equal('2011');
        await newRow.delete();
    }) 
})