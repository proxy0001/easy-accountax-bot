const parser = require("../utils/parser.js");
const expect = require("chai").expect;

// a test suite for parser
describe('testing our parser', function () {
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
})