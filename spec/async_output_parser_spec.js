var PEG = require('pegjs'),
    fs = require('fs');

var parse = PEG.buildParser(fs.readFileSync(__dirname + '/../src/gdbmi.pegjs', 'utf-8'), {
  allowedStartRules: ['async_output']
}).parse;

describe('Async output parser', function () {
  function parseFixture (name) {
    return parse(fs.readFileSync(__dirname + '/fixtures/' + name + '.txt', 'utf-8').trim());
  }

  it('can parse async output with no results', function () {
    expect(parseFixture('async_output_with_no_results')).toEqual({
      type: 'async_output',
      cls: 'stopped'
    });
  });

  it('can parse async output with results', function () {
    expect(parseFixture('async_output_with_results')).toEqual({
      type: 'async_output',
      cls: 'stopped',
      results: {
        'thread-id': 1,
        'stopped-threads': 'all'
      }
    });
  });
});
