const fs = require('fs')

exports.openFile  = function (fileName) {
  try {
    var data = fs.readFileSync(fileName, 'utf8')
  } catch(e) {
    console.log('\x1b[31mError ao ler ' + fileName + ' :\n\x1b[0m', e.stack)
  }
  return data
}

exports.createTable = function() {
  try {
    var data = JSON.parse(fs.readFileSync('reservedWords.json'))
  } catch(e) {
    console.log('\x1b[31mError ao ler reservedWords.json:\n\x1b[0m', e.stack)
  }

  var dict = {}
  for(var it = 0; data[it] != null; it++) {
    dict[data[it]] = {token: data[it], lexeme: data[it], type: null}
  }
  
  return dict
}
