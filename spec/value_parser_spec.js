var PEG = require('pegjs'),
    fs = require('fs');

var parse = PEG.buildParser(fs.readFileSync(__dirname + '/../src/gdbmi.pegjs', 'utf-8'), {
  allowedStartRules: ['value']
}).parse;

describe('Value parser', function () {
  it('can parse c-strings', function () {
    expect(parse('"hello"')).toEqual('hello');
    expect(parse('"he\\"llo"')).toEqual('he\\"llo');
  });

  it('can parse integer strings', function () {
    expect(parse('"123"')).toEqual(123);
  });

  it('can parse empty lists', function () {
    expect(parse('[]')).toEqual([]);
  });

  it('can parse simple lists', function () {
    expect(parse('["123","hello"]')).toEqual([
      123,
      'hello'
    ]);
  });

  it('can parse complex lists', function () {
    expect(parse('[a="123",b="hello"]')).toEqual({
      a: 123,
      b: 'hello'
    });

    expect(parse('[a="123",b=[c="hello"]]')).toEqual({
      a: 123,
      b: {
        c: 'hello'
      }
    });

    expect(parse('[{a="123"}]')).toEqual([{
      a: 123
    }]);
  });

  it('can parse empty tuples', function () {
    expect(parse('{}')).toEqual({});
  });

  it('can parse simple tuples', function () {
    expect(parse('{a="123",b="hello"}')).toEqual({
      a: 123,
      b: 'hello'
    });
  });

  it('can parse complex tuples', function () {
    expect(parse('{a=["123",{c="hi"}],b="hello"}')).toEqual({
      a: [
        123,
        {
          c: 'hi'
        }
      ],
      b: 'hello'
    });
  });
});
