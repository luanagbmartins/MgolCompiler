const syn = require('./syntaxAnalysis')

console.log('\x1b[36m---    Mgol Compiler   ---\x1b[0m\n')

const args = process.argv
if (!args[2]) {
    console.log('Please include the path to the program')
    return
}


// Tabela de Simbolos preenchida com as palavras reservadas da linguagem
global.symbolTable = {
    inicio:       { lexeme: 'inicio',    token: 'inicio',    type: null },
    varinicio:    { lexeme: 'varinicio', token: 'varinicio', type: null },
    varfim:       { lexeme: 'varfim',    token: 'varfim',    type: null },
    escreva:      { lexeme: 'escreva',   token: 'escreva',   type: null },
    leia:         { lexeme: 'leia',      token: 'leia',      type: null },
    se:           { lexeme: 'se',        token: 'se',        type: null },
    entao:        { lexeme: 'entao',     token: 'entao',     type: null },
    fimse:        { lexeme: 'fimse',     token: 'fimse',     type: null },
    fim:          { lexeme: 'fim',       token: 'fim',       type: null },
    inteiro:      { lexeme: 'inteiro',   token: 'inteiro',   type: 'int' },
    lit:          { lexeme: 'lit',       token: 'lit',       type: 'literal' },
    real:         { lexeme: 'real',      token: 'real',      type: 'double' }
}

// Criacao de uma instancia do sintatico
// args[2] refere-se ao nome do arquivo de analise
var syntax = new syn(args[2])

// Analise sintatica
syntax.run()
