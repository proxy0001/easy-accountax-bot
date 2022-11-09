const parser = require("../parser.js");
const expect = require("chai").expect;

// a test suite for parser
describe('testing our parser', function () {
    it('should return [] when the input is empty', function () {
        expect(parser('')).to.eql([])
    })

    it('should return words as title, numbers as amount when the input is not empty', function () {
        const [title, amount, createDatetime] = parser('hello 100');
        expect(title).to.equal('hello');
        expect(amount).to.equal(100);
    })
})