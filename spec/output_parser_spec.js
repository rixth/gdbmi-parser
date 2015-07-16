var PEG = require('pegjs'),
    fs = require('fs');

var parse = PEG.buildParser(fs.readFileSync(__dirname + '/../src/gdbmi.pegjs', 'utf-8'), {
  allowedStartRules: ['output']
}).parse;

describe('Output parser', function () {
  function parseFixture (name) {
    return parse(fs.readFileSync(__dirname + '/fixtures/' + name + '.txt', 'utf-8'));
  }

  it('can parse full output', function () {
    expect(parseFixture('output_1')).toEqual({
      records: [
        {
          type: 'notify_async_output',
          cls: 'thread-group-started',
          results: {
            id: 'i1',
            pid: 42000
          },
          token: 123
        },
        {
          type: 'notify_async_output',
          cls: 'thread-created',
          results: {
            id: 1,
            'group-id': 'i1'
          },
          token: 123
        },
        {
          type: 'exec_async_output',
          cls: 'stopped',
          results: {
            frame: {
              addr: '0x000000e8',
              func: 'main',
              args: [],
              file: 'test.c',
              fullname: '/path/to/file.c',
              line: 16
            },
            'thread-id': 1,
            'stopped-threads': 'all'
          },
          token: 123
        }
      ],
      result: {
        token: 123,
        cls: 'connected',
        type: 'result_record'
      }
    });
  });
});
