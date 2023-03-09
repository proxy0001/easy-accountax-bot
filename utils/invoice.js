const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();
const { sheetHeader, initSheet, addRecord } = require("./sheet.js");

const EINV_URL = 'https://api.einvoice.nat.gov.tw/PB2CAPIVAN/invServ/InvServ'
const WAIT_MS = 3000
const TRY_AGAIN_MS = 1000 * 60 * 15 // try again after 15 minutes
const MAX_RETRY = 10
const DAY_RANGE = 3

const timeout = (ms) => {
  console.log('wait seconds: ', ms / 1000)
  return new Promise(resolve => setTimeout(resolve, ms))
}
const formatDate = (date) => `${date.year + 1911}/${date.month.toString().padStart(2, '0')}/${date.date.toString().padStart(2, '0')}`

const getInvoices = async (startDate, endDate, retry = 0) => {
  if (retry > 0) await timeout(WAIT_MS)

  const params = {
      version: 0.3,
      cardType: '3J0002',
      cardNo: process.env.EINV_CARD_NO,
      expTimeStamp: (Date.now() + 10).toString(),
      action: 'carrierInvChk',
      timeStamp: Date.now() + 10,
      startDate,
      endDate,
      onlyWinningInv: 'N',
      uuid,
      appID: process.env.EINV_APP_ID,
      cardEncrypt: process.env.EINV_CARD_ENCRYPT,
  }
  const searchParams = new URLSearchParams(params).toString()

  return await fetch(`${EINV_URL}?${searchParams}`, { method: 'POST' })
    .then(res => {
      if (res.status !== 200) {
        console.log('res', res)
        return Promise.reject(new Error(`${res.status}: ${statusText}`))
      }
      return res.json()
    }).then(data => {
      if (data.code !== 200) {
        console.log('json', data)
        return Promise.reject(new Error(`${data.code}: ${data.msg}`))
      }
      return data
    }).catch(error => {
      if (retry < MAX_RETRY) {
        console.log(`retry getInvoices (${retry + 1})`)
        return getInvoices(startDate, endDate, retry + 1)
      } else {
        console.log('catch get invoices error', error)
        return Promise.reject(new Error(error))
      }
    })
}

const getInvoiceDetail = async (invNum, invDate, retry = 0) => {
  if (retry > 0) await timeout(WAIT_MS)

  const params = {
      version: 0.3,
      cardType: '3J0002',
      cardNo: process.env.EINV_CARD_NO,
      expTimeStamp: (Date.now() + 10).toString(),
      action: 'carrierInvDetail',
      timeStamp: Date.now() + 10,
      invNum,
      invDate: formatDate(invDate),
      uuid,
      appID: process.env.EINV_APP_ID,
      cardEncrypt: process.env.EINV_CARD_ENCRYPT,
  }
  const searchParams = new URLSearchParams(params).toString()

  return await fetch(`${EINV_URL}?${searchParams}`, { method: 'POST' })
    .then(res => {
      if (res.status !== 200) {
        console.log('res', res)
        return Promise.reject(new Error(`${res.status}: ${statusText}`))
      }
      return res.json()
    }).then(data => {
      if (data.code !== 200) {
        console.log('json', data)
        return Promise.reject(new Error(`${data.code}: ${data.msg}`))
      }
      return data
    }).catch(error => {
      if (retry < MAX_RETRY) {
        console.log(`retry getInvoiceDetail (${retry + 1})`)
        return getInvoiceDetail(invNum, invDate, retry + 1)
      } else {
        console.log('catch get invoice detail error', error)
        return Promise.reject(new Error(error))
      }
    })
}

const recordInvoice = async (sheet, invoiceDetail, callback) => {
  const items = invoiceDetail.details.reduce((acc, cur, idx) => {
    const name = cur.description
    const quantity = parseInt(cur.quantity) === 1 ? '' : `*${parseInt(cur.quantity)}`
    const amount = parseInt(cur.amount)
    const itemStr = `${name}${quantity} ${amount}`
    if (idx === 0) return itemStr
    else return `${acc}、${itemStr}`
  }, '')
  const date = [].reduce.apply(invoiceDetail.invDate, [(acc, cur, idx) => {
    if (idx === 4 || idx === 6) return acc + '/' + cur
    else return acc + cur
  }, ''])

  const newRow = await addRecord(sheet, {
    [sheetHeader.store]: invoiceDetail.sellerName, //.split(/(股份有限公司|有限公司)/)[0],
    [sheetHeader.items]: items,
    [sheetHeader.amount]: parseInt(invoiceDetail.amount),
    [sheetHeader.date]: date,
    [sheetHeader.invoiceId]: invoiceDetail.invNum,
  })

  if (typeof callback === 'function') callback(newRow)
}

const recordInvoices = async (options) => {
  const { days = DAY_RANGE, retry = 0, callback } = options
  if (retry > 0) await timeout(TRY_AGAIN_MS)

  const sheet = await initSheet()
  const rows = await sheet.getRows()
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replaceAll('-', '/')
  const endDate = (new Date()).toISOString().split('T')[0].replaceAll('-', '/')

  console.log('start to get invoices')
  await timeout(WAIT_MS)
  const data = await getInvoices(startDate, endDate)
    .then(data => {
      console.log('get invoices success!')
      return data
    })
    .catch(error => {
      console.log('get invoices error: ', error)
      if (retry < MAX_RETRY) {
        console.log(`retry recordInvoices (${retry + 1})`)
        return recordInvoices({ ...options, retry: retry + 1 })
      } else {
        console.log('catch get invoice retry over max error', error)
        throw new Error(error)
      }
    })
  const invoices = data?.details || []
  invoices.sort((a, b) => a.invDate.time > b.invDate.time ? 1 : -1)
  console.log('start to check that are invoices recorded: ', invoices.length)
  let countRecorded = 0
  for (let i = 0;i < invoices.length; i++) {
    const invoice = invoices[i]
    const isRecorded = rows.findIndex(row => row[sheetHeader.invoiceId] === invoice.invNum) > -1
    console.log('isRecorded', isRecorded)
    if (isRecorded) {
      countRecorded++
      continue
    }
    console.log('start to get invoice detail')
    await timeout(WAIT_MS)
    await getInvoiceDetail(invoice.invNum, invoice.invDate)
      .then(data => {
        console.log('get invoice detail success! ', i)
        recordInvoice(sheet, data, callback)
      }).catch(error => {
        console.log('get invoice detail error: ', error, invoice)
        if (retry < MAX_RETRY) {
          console.log(`retry recordInvoices (${retry + 1})`)
          return recordInvoices({ ...options, retry: retry + 1 })
        } else {
          console.log('catch get invoice retry over max error', error)
          throw new Error(error)
        }
      })
  }
  console.log(`
recorded: ${countRecorded}
unrecorded: ${invoices.length - countRecorded}
total: ${invoices.length}
`)
}

module.exports = {
  recordInvoices,
}