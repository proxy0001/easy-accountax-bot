const { initSheet } = require("../utils/sheet.js");
const { recordInvoices } = require("../utils/invoice.js");
const { expect } = require("chai");
// load dotenv
require('dotenv').config();

var sheet;

before(async function () {
    const credentials = {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
    const docId = process.env.GOOGLE_DOC_ID;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    sheet = await initSheet(credentials, docId, sheetId);
});

// a test suite for hanlding google sheet
describe('testing invoices recording',async function () {
    it('should get invoices and record into google sheet', async function () {
        this.timeout(5000000);
        await recordInvoices({ days: 4, callback: newRow => {
            console.log(newRow)
        }});
    })
})