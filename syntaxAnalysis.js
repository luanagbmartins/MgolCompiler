const csvConverter = require('convert-csv-to-json')
const lex = require('./lexicalAnalysis')


class Syntax {

    constructor (filename) {

        this._lexical = new lex(filename)                                                                   // Instancia do analisador lexico
        this._stack = []                                                                                    // Pilha de estados
        this._shiftReduce = csvConverter.fieldDelimiter(',').getJsonFromCsv('./shiftReduceTable.csv')       // Pega a tabela shift-reduce
        this._grammar = {                                                                                   // Enumera a gramatica da linguagem
            '1': {'P\'': ['P']},
            '2': {'P': ['inicio', 'V', 'A']},
            '3': {'V': ['varinicio', 'LV']},
            '4': {'LV': ['D', 'LV']},
            '5': {'LV': ['varfim', 'PT_V']},
            '6': {'D': ['ID', 'TIPO', 'PT_V']},
            '7': {'TIPO': ['int']},
            '8': {'TIPO': ['real']},
            '9': {'TIPO': ['lit']},
            '10': {'A': ['ES', 'A']},
            '11': {'ES': ['leia', 'ID', 'PT_V']},
            '12': {'ES': ['escreva', 'ARG', 'PT_V']},
            '13': {'ARG': ['Literal']},
            '14': {'ARG': ['Num']},
            '15': {'ARG': ['ID']},
            '16': {'A': ['CMD', 'A']},
            '17': {'CMD': ['ID', 'RCB', 'LD', 'PT_V']},
            '18': {'LD': ['OPRD', 'OPM', 'OPRD']},
            '19': {'LD': ['OPRD']},
            '20': {'OPRD': ['ID']},
            '21': {'OPRD': ['Num']},
            '22': {'A': ['COND', 'A']},
            '23': {'COND': ['CABECALHO', 'CORPO']},
            '24': {'CABECALHO': ['se', 'AB_P', 'EXP_R', 'FC_P', 'entao']},
            '25': {'EXP_R': ['OPRD', 'opr', 'OPRD']},
            '26': {'CORPO': ['ES', 'CORPO']},
            '27': {'CORPO': ['CMD', 'CORPO']},
            '28': {'CORPO': ['COND', 'CORPO']},
            '29': {'CORPO': ['fimse']},
            '30': {'A': ['fim']}
        }

    }

    run() {

        var tuple = this._lexical.getToken()        // Chama o lexico para retornar uma tupla do tipo {token: , lexeme:, value: }
        if (!tuple) return                          // Se nao tiver uma tupla, ocorreu um erro lexico
        var token = tuple.token                     // Armazena o token da tupla retornada
        this._stack.push('0')                       // Empilha o primeiro estado 

        while (true) {

            var state = this._stack[this._stack.length-1]       // Olha o estado que está no topo da pilha

            if (this._shiftReduce[state][token]) {      // Se tiver uma transicao na tabela

                var action = this._shiftReduce[state][token][0]             // Pega a acao que deverá ser realizada (shift, reduce, ...)
                var args = this._shiftReduce[state][token].substring(1)     // E seus argumentos (estado, regra, ...)

                if (action == 'S') {        // Acao: shift

                    this._stack.push(args)              // Empilha o estado relacionado
                    tuple = this._lexical.getToken()    // Pede a proxima tupla do lexico
                    if (!tuple) return                  // TODO olhar quando o token retornado for um ERROR
                    token = tuple.token                 // Armazena o token da tupla retornada

                }

                else if (action == 'R') {       // Acao: reduce A -> Beta

                    var reduction = this._grammar[args]     // Pega os argumentos Beta da regra a ser reduzida
                    var key = Object.keys(reduction)[0]     // Pega o argumento A da regra a ser reduzida

                    for (var it = 0; it < reduction[key].length; it++) { 
                        this._stack.pop()                   // Desempilha simbolos |Beta| da pilha
                    }
                    
                    this._stack.push(this._shiftReduce[this._stack[this._stack.length-1]][key])     // Empilha o estado da transicao [topoPilha, A]
                    console.log(key + ' -> ' + reduction[key])                                      // Mostra na tela a regra reduzida

                }

                else if (action == 'A') {       // Acao: accept
                    return
                }

                else {      // Um erro sintatico ocorreu: chamar rotina de recuperacao de erro
                    // TODO
                    console.log("Error Sintatico")
                    return
                }

            }

            else {
                if (tuple == 'ERROR') {                 // Se a tupla retornada for igual a 'ERROR' um erro lexico aconteceu
                    tuple = this._lexical.getToken()    // Pede a proxima tupla do lexico
                    if (!tuple) return                  // TODO olhar quando o token retornado for um ERROR
                    token = tuple.token                 // Armazena o token da tupla retornada
                }
                else {      // Um erro sintatico ocorreu: chamar rotina de recuperacao de erro
                    console.log('Error Sintatico ' + state + ' ' + token)
                    console.log(this._stack)
                    return
                }
            }

        }

    }
}

module.exports = Syntax