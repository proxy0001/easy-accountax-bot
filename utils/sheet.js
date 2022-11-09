const { GoogleSpreadsheet } = require('google-spreadsheet');

async function initSheet (credentials, docId, sheetId) {
    const doc = new GoogleSpreadsheet(docId);
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    return doc.sheetsById[sheetId];
}

async function addRecord (sheet, data) {
    return await sheet.addRow(data);
}

module.exports = {
    initSheet,
    addRecord,
}