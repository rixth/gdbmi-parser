{
  function variablePairsToMap (pairs) {
    return pairs.reduce(function (memo, pair) {
      memo[pair.name] = pair.value;
      return memo;
    }, {});
  }

  function flattenCommaResults(raw) {
    return raw.map(function (result) {
      return result[1];
    });
  }
}

// This start rule is for matching a set of lines ending with the (gdb) prompt
output
  = oob:out_of_band_record* result:result_record? "(gdb)" nl { return {
    records: oob,
    result: result
  }}

// This start rule is for matching a single line of output
single_line
  = out_of_band_record
  / result_record
  / "(gdb)" nl { return {
    cls: 'EOF'
  } }

result_record
  = token:digits? "^" cls:result_class results:("," result)* nl {
    var ret = {};
    if (token) ret.token = token;
    ret.cls = cls;
    ret.type = 'result_record';
    if (results.length) {
      ret.results = variablePairsToMap(flattenCommaResults(results));
    }
    return ret;
  }

result_class
  = "done"
  / "running"
  / "connected"
  / "error"
  / "exit"

out_of_band_record
  = async_record
  / stream_record

async_record
  = exec_async_output
  / status_async_output
  / notify_async_output

async_class
  = "stopped"
  / prefix:async_class_prefix rest:string { return prefix + rest }
  / string // The GDB/MI manual has a non-exhaustive set, unfortunately

async_class_prefix
  = "thread-"
  /

async_output
  = cls:async_class results:("," result)* {
    var ret = {
      type: 'async_output',
      cls: cls
    }
    if (results.length) {
      ret.results = variablePairsToMap(flattenCommaResults(results))
    }
    return ret
  }

exec_async_output
  = token:digits? "*" output:async_output nl {
    if (token) output.token = token;
    output.type = 'exec_async_output';
    return output;
  }

status_async_output
  = token:digits? "+" output:async_output nl {
    if (token) output.token = token;
    output.type = 'status_async_output';
    return output;
  }

notify_async_output
  = token:digits? "=" output:async_output nl {
    if (token) output.token = token;
    output.type = 'notify_async_output';
    return output;
  }

stream_record
  = console_stream_output
  / target_stream_output
  / log_stream_output

console_stream_output
  = "~" str:c_string nl { return {
    type: 'console_stream_output',
    results: str
  } }

target_stream_output
  = "@" str:c_string nl { return {
    type: 'target_stream_output',
    results: str
  } }

log_stream_output
  = "&" str:c_string nl { return {
    type: 'log_stream_output',
    results: str
  } }

result
  = name:variable "=" value:value { return {
    literal: 'variable',
    name: name,
    value: value
  } }

variable
  = string

value
  = digit_string
  / const
  / tuple
  / list

tuple
  = "{}" { return {} }
  / "{" first:result rest:("," result)* "}" {
    var obj = {};
    obj[first.name] = first.value;
    rest.forEach(function (result) {
      obj[result[1].name] = result[1].value;
    })
    return obj;
  }

list
  = "[]" { return [] }
  / "[" first:value rest:("," value)* "]" {
    var results = [first].concat(flattenCommaResults(rest));
    return results;
  }
  / "[" first:result rest:("," result)* "]" {
    var results = [first].concat(flattenCommaResults(rest));
    return variablePairsToMap(results);
  }

const
  = c_string

digits
  = digits:$[0-9]+ { return parseInt(digits, 10) }

digit_string
  = '"' digits:$[0-9]+ '"' { return parseInt(digits, 10) }

nl
  = "\r\n"
  / "\r"
  / "\n"

string
  = chars:$[a-zA-Z0-9_-]+ { return chars }

c_string
  = "\"" str:(!unscapedquote anycharacter)* last:unscapedquote {
    var r = "";
    for (var c in str) {
      r += str[c][1];
    }
    return r + last;
  }

unscapedquote
  = last:[^\\] "\"" { return last }

anycharacter
  = .
