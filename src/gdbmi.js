var lineParser = require('./gdbmi-line'),
    outputParser = require('./gdbmi-output');

module.exports = {
  parseLine: lineParser.parse,
  parseOutput: outputParser.parse,
  lineParser: lineParser,
  outputParser: outputParser
};
