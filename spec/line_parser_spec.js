var PEG = require('pegjs'),
    fs = require('fs');

var parse = PEG.buildParser(fs.readFileSync(__dirname + '/../src/gdbmi.pegjs', 'utf-8'), {
  allowedStartRules: ['single_line']
}).parse;

describe('Line parser', function () {
  function parseFixture (name) {
    return parse(fs.readFileSync(__dirname + '/fixtures/' + name + '.txt', 'utf-8'));
  }

  it('can parse console stream output', function () {
    expect(parseFixture('console_stream_output')).toEqual({
      type: 'console_stream_output',
      results: 'this is console output'
    });
  });

  it('can parse exec async output', function () {
    expect(parseFixture('exec_async_output')).toEqual({
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
    });
  });

  it('can parse gdb eof', function () {
    expect(parseFixture('gdb_eof')).toEqual({
      cls: 'EOF'
    });
  });

  it('can parse log stream output', function () {
    expect(parseFixture('log_stream_output')).toEqual({
      type: 'log_stream_output',
      results: 'this is log output'
    });
  });

  it('can parse notify async output', function () {
    expect(parseFixture('notify_async_output')).toEqual({
      type: 'notify_async_output',
      cls: 'thread-group-started',
      results: {
        id: 'i1',
        pid: 42000
      },
      token: 123
    });
  });

  it('can parse result record', function () {
    expect(parseFixture('result_record')).toEqual({
      token: 123,
      cls: 'connected',
      type: 'result_record',
      results: {
        'thread-id': 1
      }
    });
  });

  it('can parse status async output', function () {
    expect(parseFixture('status_async_output')).toEqual({
      type: 'status_async_output',
      cls: 'paused',
      results: {
        'thread-id': 1,
        'stopped-threads': 'all'
      },
      token: 123
    });
  });

  it('can parse target stream output', function () {
    expect(parseFixture('target_stream_output')).toEqual({
      type: 'target_stream_output',
      results: 'this is target output'
    });
  });
});
