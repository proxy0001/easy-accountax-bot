const { GoogleSpreadsheet } = require('google-spreadsheet');

const sheetHeader = {
    date: '日期',
    store: '店家',
    items: '品項',
    amount: '金額',
    invoiceId: '統一發票',
    note: '備註',
}

async function initSheet () {
    const isTestEnv = process.env.APP_ENV === 'TEST'
    const config = isTestEnv ? {
        docId: process.env.TEST_GOOGLE_DOC_ID,
        sheetId: process.env.TEST_GOOGLE_SHEET_ID,
        credentials: {
            client_email: process.env.TEST_GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.TEST_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
    } : {
        docId: process.env.GOOGLE_DOC_ID,
        sheetId: process.env.GOOGLE_SHEET_ID,
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
    }
    const doc = new GoogleSpreadsheet(config.docId);
    await doc.useServiceAccountAuth(config.credentials);
    await doc.loadInfo();
    return doc.sheetsById[config.sheetId];
}

async function addRecord (sheet, data) {
    return await sheet.addRow(data);
}

module.exports = {
    sheetHeader,
    initSheet,
    addRecord,
}