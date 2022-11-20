const parser = require("../utils/parser.js");
const expect = require("chai").expect;

// a test suite for parser
describe('support single lines', function () {
    it('should return [] when the input is empty', function () {
        expect(parser('')).to.eql([])
    })

    it('should return words as title, numbers as amount when the input is not empty', function () {
        const [title, items, amount, createDatetime] = parser('hello 100');
        expect(title).to.equal('hello');
        expect(amount).to.equal(100);
    })

    it('should return any charachters as title, numbers in the end as amount when the title has numbers', function () {
        const [title, items, amount, createDatetime] = parser('hel23 lo 100');
        expect(title).to.equal('hel23 lo');
        expect(amount).to.equal(100);
    })

    it('should return any charachters as title, numbers in the end as amount even without space between', function () {
        const [title, items, amount, createDatetime] = parser('hel23 lo100');
        expect(title).to.equal('hel23 lo');
        expect(amount).to.equal(100);
    })

    it('should separate title and items correctly and amount is the sum of items', function () {
        const [title, items, amount, createDatetime] = parser('adsf11sdf    adfasdf 12 adfadf 12 asdfasdf 2122');
        expect(title).to.equal('adsf11sdf');
        expect(items).to.equal(`adfasdf 12\nadfadf 12\nasdfasdf 2122`);
        expect(amount).to.equal(2146);
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