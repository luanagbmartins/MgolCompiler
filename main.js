const dt = require('./auxFunctions')
const lex = require('./lexicalAnalysis')

const args = process.argv;

// Tabela de Simbolos preenchida com as palavras reservadas da linguagem
global.symbolTable = dt.createTable()

// Criacao de uma instacia do lexico
// args[2] refere-se ao nome do arquivo de analise
var lexical = new lex(args[2])
var tokensTable = []
do {

    // Solicita um token para o lexico
    var recognized = lexical.getToken()
    if (recognized != 'ERROR')
        tokensTable.push(recognized)

} while(recognized.token != 'EOF') // Token EOF representa o final do arquivo

console.log('\n\n\x1b[92m---------- Tabela de Tokens reconhecidos -------------\x1b[0m')
console.dir(tokensTable)

// Mostra Tabela de simbolos depois da leitura de todo o arquivo
console.log('\n\n\x1b[92m---------------- Tabela de simbolos -------------------\x1b[0m')
console.dir(symbolTable)