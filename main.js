const dt = require('./auxFunctions')
const syn = require('./syntaxAnalysis')


const args = process.argv;

// Tabela de Simbolos preenchida com as palavras reservadas da linguagem
global.symbolTable = dt.createTable()

// Criacao de uma instancia do sintatico
// args[2] refere-se ao nome do arquivo de analise
var syntax = new syn(args[2])

// Analise sintatica
syntax.run()