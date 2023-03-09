const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

const sheetHeader = {
    date: '日期',
    store: '店家',
    items: '品項',
    amount: '金額',
    invoiceId: '統一發票',
    note: '備註',
    primaryCategory: '大分類',
    secondaryCategory: '小分類',
}

const category = [
    { label: '外食', tags: { [sheetHeader['primaryCategory']]: '伙食', [sheetHeader['secondaryCategory']]: '外食'} },
    { label: '食材', tags: { [sheetHeader['primaryCategory']]: '伙食', [sheetHeader['secondaryCategory']]: '食材'} },
    { label: '用品', tags: { [sheetHeader['primaryCategory']]: '用品', [sheetHeader['secondaryCategory']]: '日用品'} },
    { label: '交通', tags: { [sheetHeader['primaryCategory']]: '交通', [sheetHeader['secondaryCategory']]: ''} },
    { label: '住房', tags: { [sheetHeader['primaryCategory']]: '住房', [sheetHeader['secondaryCategory']]: '大樓管理費'} },
    { label: '水電', tags: { [sheetHeader['primaryCategory']]: '住房', [sheetHeader['secondaryCategory']]: '水電瓦斯'} },
    { label: '電話', tags: { [sheetHeader['primaryCategory']]: '通訊', [sheetHeader['secondaryCategory']]: '電話費'} },
    { label: '交際', tags: { [sheetHeader['primaryCategory']]: '交際', [sheetHeader['secondaryCategory']]: ''} },
    { label: '旅行', tags: { [sheetHeader['primaryCategory']]: '旅行', [sheetHeader['secondaryCategory']]: ''} },
    { label: '治裝', tags: { [sheetHeader['primaryCategory']]: '治裝', [sheetHeader['secondaryCategory']]: ''} },
    { label: '美容', tags: { [sheetHeader['primaryCategory']]: '美容', [sheetHeader['secondaryCategory']]: ''} },
    { label: '娛樂', tags: { [sheetHeader['primaryCategory']]: '娛樂', [sheetHeader['secondaryCategory']]: ''} },
    { label: '學習', tags: { [sheetHeader['primaryCategory']]: '學習', [sheetHeader['secondaryCategory']]: ''} },
    { label: '保險', tags: { [sheetHeader['primaryCategory']]: '保險', [sheetHeader['secondaryCategory']]: '健保'} },
    { label: '醫療', tags: { [sheetHeader['primaryCategory']]: '醫療', [sheetHeader['secondaryCategory']]: ''} },
    { label: '稅務', tags: { [sheetHeader['primaryCategory']]: '稅務', [sheetHeader['secondaryCategory']]: '所得稅'} },
    { label: '其他', tags: { [sheetHeader['primaryCategory']]: '其他', [sheetHeader['secondaryCategory']]: ''} },
  ]

async function initSheet () {
    const config = {
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
    category,
    initSheet,
    addRecord,
}