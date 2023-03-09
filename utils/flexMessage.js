const { sheetHeader, category } = require("./sheet.js");

const receiptTagObj = (tag) => ({
  type: "text",
  text: tag,
  weight: "bold",
  color: "#1DB446",
  size: "sm",
})
const receiptTitleObj = (title) => ({
  type: "text",
  text: title,
  weight: "bold",
  size: "xxl",
  margin: "md",
})
const receiptDateObj = (date) => ({
  type: "text",
  text: date,
  size: "xs",
  color: "#aaaaaa",
  wrap: true,
})
const receiptSeparatorObj = () => ({
  type: "separator",
  margin: "xl",
})
const receiptMainItemNameObj = (name) => ({
  type: "text",
  text: name,
  size: "sm",
  weight: "bold",
  color: "#1DB446",
  flex: 0,
})
const receiptMainItemValueObj = (name) => ({
  type: "text",
  text: name,
  size: "sm",
  weight: "bold",
  color: "#1DB446",
  align: "end",
})
const receiptItemNameObj = (name) => ({
  type: "text",
  text: name,
  size: "sm",
  color: "#555555",
  flex: 0,
})
const receiptItemValueObj = (value) => ({
  type: "text",
  text: value,
  size: "sm",
  color: "#555555",
  align: "end",
})
const receiptNoteItemNameObj = (name) => ({
  type: "text",
  text: name,
  size: "xs",
  color: "#aaaaaa",
  flex: 0,
})
const receiptNoteItemValueObj = (value) => ({
  type: "text",
  text: value,
  size: "xs",
  color: "#aaaaaa",
  align: "end",
})
const receiptItemObj = (name, value) => ({
  "type": "box",
  "layout": "horizontal",
  "contents": [
    receiptItemNameObj(name),
    receiptItemValueObj(value),
  ]
})
const receiptTopMainItemObj = (name, value) => ({
  type: "box",
  layout: "horizontal",
  margin: "md",
  contents: [
    receiptMainItemNameObj(name),
    receiptMainItemValueObj(value),
  ]
})
const receiptContentObj = (contents) => ({
  type: "box",
  layout: "vertical",
  margin: "xxl",
  spacing: "sm",
  contents,
})
const receiptNoteItemObj = (name, value) => ({
  type: "box",
  layout: "horizontal",
  margin: "md",
  contents: [
    receiptNoteItemNameObj(name),
    receiptNoteItemValueObj(value),
  ]
})
const buttonObj = (action, isPrimary=false) => ({
  type: "button",
  style: isPrimary ? "primary" : "secondary",
  color: isPrimary ? "#4169e1" : "#ffd5ef",
  height: "sm",
  flex: 0,
  action,
})
const buttonGroupObj = (contents) => ({
  type: "box",
  layout: "horizontal",
  spacing: "md",
  // justifyContent: "space-around",
  contents,
})
const isPrimary = (a, b) => {
  return a[sheetHeader.primaryCategory] === b[sheetHeader.primaryCategory] &&
    a[sheetHeader.secondaryCategory] === b[sheetHeader.secondaryCategory]
}
const receiptActionsObj = (sheetData) => {
  return category.reduce((acc, cur, idx) => {
    const i = Math.floor(idx / 4)
    if (acc[i] === undefined) acc[i] = buttonGroupObj([])
    const params = new URLSearchParams({
      rowNumber: sheetData.rowNumber,
      [sheetHeader.date]: sheetData[sheetHeader.date],
      [sheetHeader.store]: sheetData[sheetHeader.store],
      [sheetHeader.amount]: sheetData[sheetHeader.amount],
      [sheetHeader.primaryCategory]: sheetData[sheetHeader.primaryCategory],
      [sheetHeader.secondaryCategory]: sheetData[sheetHeader.secondaryCategory],
      ...cur.tags,
    })
    if (sheetData[sheetHeader.invoiceId]) params.append(sheetHeader.invoiceId, sheetData[sheetHeader.invoiceId])

    acc[i].contents.push(buttonObj({
      type: 'postback',
      label: cur.label,
      data: decodeURIComponent(params.toString()),
    }, isPrimary(sheetData, cur.tags)))
    return acc
  }, [])
}
const receiptBubble = (bodyContents, footerContents) => ({
  type: "bubble",
  body: {
    type: "box",
    layout: "vertical",
    contents: bodyContents,
  },
  footer: {
    type: "box",
    layout: "vertical",
    spacing: "md",
    contents: footerContents,
  },
  styles: {
    body: {
      backgroundColor: "#f8f8ff",
    },
    footer: {
      backgroundColor: "#ff6cb6",
      separator: true
    }
  }
})
const receiptMsg = (sheetData) => {
  const altText = Object.entries(sheetData).map(entry => `${entry[0]}: ${entry[1]}`).join('\n')
  const title = sheetData[sheetHeader.store]
  const date = sheetData[sheetHeader.date]
  const receiptId = ''
  let contents = []
  const itemObjs = sheetData[sheetHeader.items].split('、').map(str => {
    const matches = str.match(/(.+) (-?[\d]+)/)
    return receiptItemObj(matches[1], matches[2])
  })
  contents = contents.concat(itemObjs)
  contents = contents.concat([
    receiptSeparatorObj(),
    receiptTopMainItemObj('TOTAL', `${sheetData[sheetHeader.amount]}`),
  ])
  let bodyContents = [
    // receiptTagObj('RECEIPT'),
    receiptTitleObj(title),
    receiptDateObj(date),
    // receiptSeparatorObj(),
    receiptContentObj(contents),
  ]
  if (receiptId.length > 0) {
    bodyContents = bodyContents.concat([
      receiptSeparatorObj(),
      receiptNoteItemObj('RECEIPT ID', receiptId),
    ])
  }
  const footerContents = receiptActionsObj(sheetData)
  return {
    "type": "flex",
    "altText": altText,
    "contents": receiptBubble(bodyContents, footerContents)
  }
}

module.exports = {
  receiptMsg,
}