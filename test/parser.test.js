const parser = require("../utils/parser.js");
const expect = require("chai").expect;

// a test suite for parser
describe('support one line', function () {
    it('should return [] when the input is empty', function () {
        expect(parser('')).to.eql([])
    })

    it('has empty title and 1 item, should return empty title and 1 item', function () {
        const [title, items, amount, createDatetime] = parser('hello 100');
        expect(title).to.equal('');
        expect(items).to.equal('hello 100');
        expect(amount).to.equal(100);
    })

    it('has empty title and 1 item which has no space between item name and amount, should return empty title and 1 item', function () {
        const [title, items, amount, createDatetime] = parser('hello100');
        expect(title).to.equal('');
        expect(items).to.equal('hello 100');
        expect(amount).to.equal(100);
    })

    it('has empty title and 2 item one has space between item name and amount and another is not, return title and 2 items, sum of amount of each item', function () {
        const [title, items, amount, createDatetime] = parser('goods 100 desk1000');
        expect(title).to.equal('');
        expect(items).to.equal('goods 100\ndesk 1000');
        expect(amount).to.equal(1100);
    })

    it('has title and 1 item, should return title and 1 item', function () {
        const [title, items, amount, createDatetime] = parser('shopname goods 100');
        expect(title).to.equal('shopname');
        expect(items).to.equal('goods 100');
        expect(amount).to.equal(100);
    })

    it('has title and 1 item which has no space between item name and amount, should return title and 1 item', function () {
        const [title, items, amount, createDatetime] = parser('shopname goods100');
        expect(title).to.equal('shopname');
        expect(items).to.equal('goods 100');
        expect(amount).to.equal(100);
    })

    it('has title and 2 items all have space between item name and amount, return title and 2 items, sum of amount of each item', function () {
        const [title, items, amount, createDatetime] = parser('shopname goods 100 desk 1000');
        expect(title).to.equal('shopname');
        expect(items).to.equal('goods 100\ndesk 1000');
        expect(amount).to.equal(1100);
    })

    it('has title and 2 items all have no space between item name and amount, return title and 2 items, sum of amount of each item', function () {
        const [title, items, amount, createDatetime] = parser('shopname goods100 desk1000');
        expect(title).to.equal('shopname');
        expect(items).to.equal('goods 100\ndesk 1000');
        expect(amount).to.equal(1100);
    })

    it('has title and 2 items one has space between item name and amount and another is not, return title and 2 items, sum of amount of each item', function () {
        const [title, items, amount, createDatetime] = parser('shopname goods 100 desk1000');
        expect(title).to.equal('shopname');
        expect(items).to.equal('goods 100\ndesk 1000');
        expect(amount).to.equal(1100);
    })

    it('has title and 2 items, one item name has number at the end of name, return title and 2 items, sum of amount of each item', function () {
        const [title, items, amount, createDatetime] = parser('這是店家 東西 12 東西2 12');
        expect(title).to.equal('這是店家');
        expect(items).to.equal(`東西 12\n東西2 12`);
        expect(amount).to.equal(24);
    })

});

describe('support multiple lines', function () {
    it('should separate title and items correctly and amount is the sum of items', function () {
        const [title, items, amount, createDatetime] = parser(`tafadsf asf12a
        it  em   12
        item2 21`);
        expect(title).to.equal('tafadsf asf12a');
        expect(items).to.equal(`it  em 12\nitem2 21`);
        expect(amount).to.equal(33);
    })
});