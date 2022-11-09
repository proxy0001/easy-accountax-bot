const { initSheet, addRecord } = require("../utils/sheet.js");
const expect = require("chai").expect;

var sheet;

before(async function () {
    const credentials = {
        client_email: 'google-fat@easy-accountax-bot.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChiZ82wjBpcjI3\nCFIUYbQf1e1pFrnDZ8P2IUG90zAtL/0Mpn+7A8KP58f8woJ7YdXHNKoo5+gQf+KZ\nfXSzdReyOk8fB522COnannALCSZzYXXJ4KgrTcAGsJ2nEq2goYr2B4Pz159UIEgm\nUwwGKrMb4hPEUREuxzPFtp6jhc4oFyg8gDxheFn7QXJLjDSrnDB3tyn6bSVB1Fwo\nipEjCY6FkGq6iZaO/YUq/XT8e8DfmBLP8abSChn33LAjXWHTxl/uhiUhQegtpRCb\nRppZgx6txC7G5LZNDPlAFi/j3wgEmnRuFhYtPz2p2eUDyAti6Fl0O1H2AMhjrEMZ\njzN2z+XDAgMBAAECggEAMQvimhMy9Mk2AuyVU1fpA2OGXoqGY5StdJ1bYyHstkOk\nTwN8s9Er8VqcJ5v9Vy345S+R3LKxDNVvfVAQr25FgBlhLZg34+3n5zeE6GziTlUQ\nmPeLx/4m6EEW1QQAUM3LrfDROSfGWholHfHILFUppbUqcEh28Z+NEiJlH1xAoH4P\nZEGnDU5kap/CwFomL8kdL9DWIaFFWzeV8zxS7rZK9ju4IvB3nUGP6dHIYaXA4nBy\nncWnCT8ASSy9yvGzOEu/H2d2mGw8x1XCrKF5PsIaRjAC0A2TVBaljexw1FMQbcwu\njni8JAr29AcXiT0+S0KgmAcp+1tlb4LK0eNt/hTkJQKBgQDgae7fjVigYSLZAPJ4\n5A7nOhBrr64irhJnP7d0wdJzwzFKwGcoT7JiwerLBqf3eESOEhUUiJptEb7VnmbY\nNiS09sqGTUtJg+etUBNAfJhobl0wiPC9glAwvd/sbZWNOLR+3cMAqKiHDB/ZX+3O\n4KV1yuFUh/pmvPEe5g17t40BzwKBgQC4RiLb0OU8jRqgAXF9ib5AcsPxGPIjDKC3\nkEnjMxIsJx4KhAegCHWYGOMwOtJ2EPNqATbhvoQup+zqGMxWWP07LeNjFUHBxYCp\n38ep6GaszQHE3lBaQ4K7s0lkFcQ8rZ5O0JOVLt2tp9GorQwt0rPZMzZxaqLxHQSc\nX6GmpH8dzQKBgGErXUQs9rgS9zzRHSxdS1qxmJSYMCVSDCPqwevrVM3NMdW1M7WP\ntKTwZFLeofIUgFKn37rRX1Rkv6XNfaiW4RP+XDkE1NmTJMi1iHB+wptNVkqCsQLN\nnx1Lyd6coInSiMz6BsqNPNOk21GLKPRP7zTu0NyCOFkt7JW9dQ8hrgufAoGAMby0\ngfJDPXG0gwWAtWqtUEXpvzSFfpJU+tbWKp3JROOWBy6VxEskOlZVU9o8niN7H9yO\nDKZYlSM8Hf9tf8zrJMMBAehl5EBDtxYwlRqmQ/Pdi16Z/5MDQVhl8b6yRdJyzUEc\n5IJO0SVfwJBcni2l33UkN76ZlkzHxtFFF26E5O0CgYAFfa1zsVQVjTsP/x3tk1zI\ng6yQF8or3Jck6x3yCp7/SoWqZO5Ne2TOFvo7KA0F+jwHyp5r11fKkzUtMX08iIg+\nh/cvipq3fUR1A+DqGPbhdf4iEcUwV6BrZpYIR5rvcVj9qPvtqMNj5GWdIWeKuJ5A\nPa1uYtBImnM89PsVQ8/wdA==\n-----END PRIVATE KEY-----\n',
    }
    const docId = '1noe2C2jx2durZt-sH2mvjTr6ffwOjPltX-ttn2JmJ9M';
    const sheetId = '565191926';
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