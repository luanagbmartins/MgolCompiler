var fs = require('fs')
var rs = fs.createReadStream('./fonte.alg')

exports.openFile  = function () {
  console.log('Hello! This is a test\n')

  try {
    var data = fs.readFileSync('fonte.alg', 'utf8')
    console.log(data)
  } catch(e) {
    console.log('Error: ', e.stack)
  }
    
}

rs.on('open', function() {
  console.log('The file is open')
  exports.writeFile()
})

exports.writeFile = function() {
  var code = '#include <stdio.h>'
  try {
    fs.writeFileSync('programa.c', code)
    console.log('Saved!');
  } catch(e) {
    console.log('Error: ', e.stack)
  }
}