const csvConverter = require('convert-csv-to-json')
const lex = require('./lexicalAnalysis')
const sem = require('./semanticAnalysis')


class Syntax {

    constructor (filename) {

        this._lexical = new lex(filename)                                                                   // Instancia do analisador lexico
        this._semantic = new sem(this._lexical)                                                             // Instancia do analisador semântico
        this._semanticError = false                                                                         // Variavel de verificação se houve erro semântico   
        this._stack = []                                                                                    // Pilha de estados
        this._shiftReduce = csvConverter.fieldDelimiter(',').getJsonFromCsv('./shiftReduceTable.csv')       // Pega a tabela shift-reduce
        this._grammar = {                                                                                   // Enumera a gramatica da linguagem
            '1': {'P\'': ['P']},
            '2': {'P': ['inicio', 'V', 'A']},
            '3': {'V': ['varinicio', 'LV']},
            '4': {'LV': ['D', 'LV']},
            '5': {
                'LV': ['varfim', 'PT_V'],
                'rule': 'rule5'
            },
            '6': {
                'D': ['ID', 'TIPO', 'PT_V'],
                'rule': 'rule6'
            },
            '7': {
                'TIPO': ['int'],
                'rule': 'rule7'
            },
            '8': {
                'TIPO': ['real'],
                'rule': 'rule8'
            },
            '9': {
                'TIPO': ['lit'],
                'rule': 'rule9'
            },
            '10': {'A': ['ES', 'A']},
            '11': {
                'ES': ['leia', 'ID', 'PT_V'],
                'rule': 'rule11'
            },
            '12': {
                'ES': ['escreva', 'ARG', 'PT_V'],
                'rule': 'rule12'
            },
            '13': {
                'ARG': ['Literal'],
                'rule': 'rule13'
            },
            '14': {
                'ARG': ['Num'],
                'rule': 'rule14'
            },
            '15': {
                'ARG': ['ID'],
                'rule': 'rule15'
            },
            '16': {'A': ['CMD', 'A']},
            '17': {
                'CMD': ['ID', 'RCB', 'LD', 'PT_V'],
                'rule': 'rule17'
            },
            '18': {
                'LD': ['OPRD', 'OPM', 'OPRD'],
                'rule': 'rule18'
            },
            '19': {
                'LD': ['OPRD'],
                'rule': 'rule19'
            },
            '20': {
                'OPRD': ['ID'],
                'rule': 'rule20'
            },
            '21': {
                'OPRD': ['Num'],
                'rule': 'rule21'
            },
            '22': {'A': ['COND', 'A']},
            '23': {
                'COND': ['CABECALHO', 'CORPO'],
                'rule': 'rule23'
            },
            '24': {
                'CABECALHO': ['se', 'AB_P', 'EXP_R', 'FC_P', 'entao'],
                'rule': 'rule24'
            },
            '25': {
                'EXP_R': ['OPRD', 'opr', 'OPRD'],
                'rule': 'rule25'
            },
            '26': {'CORPO': ['ES', 'CORPO']},
            '27': {'CORPO': ['CMD', 'CORPO']},
            '28': {'CORPO': ['COND', 'CORPO']},
            '29': {'CORPO': ['fimse']},
            '30': {'A': ['fim']}
        }
        this._token = ''

    }

    run() {

        var tuple = this._lexical.getToken()            // Chama o lexico para retornar uma tupla do tipo {token: , lexeme:, value: }
        if (!tuple) return                              // Se nao tiver uma tupla, ocorreu um erro lexico
        this._token = tuple.token                       // Armazena o token da tupla retornada
        this._stack.push('0')                           // Empilha o primeiro estado 

        while (true) {

            var state = this._stack[this._stack.length-1]       // Olha o estado que está no topo da pilha

            if (this._shiftReduce[state][this._token]) {        // Se tiver uma transicao na tabela

                var action = this._shiftReduce[state][this._token][0]             // Pega a acao que deverá ser realizada (shift, reduce, ...)
                var args = this._shiftReduce[state][this._token].substring(1)     // E seus argumentos (estado, regra, ...)

                if (action == 'S') {        // Acao: shift

                    this._semantic._stack.push(tuple)
                    this._stack.push(args)                      // Empilha o estado relacionado
                    tuple = this._lexical.getToken()            // Pede a proxima tupla do lexico
                    if (!tuple) return                          // TODO olhar quando o token retornado for um ERROR
                    this._token = tuple.token                   // Armazena o token da tupla retornada

                }

                else if (action == 'R') {       // Acao: reduce A -> Beta

                    var reduction = this._grammar[args]     // Pega os argumentos Beta da regra a ser reduzida
                    var key = Object.keys(reduction)[0]     // Pega o argumento A da regra a ser reduzida

                    for (var it = 0; it < reduction[key].length; it++) { 
                        this._stack.pop()                   // Desempilha simbolos |Beta| da pilha
                    }
                    
                    this._stack.push(this._shiftReduce[this._stack[this._stack.length-1]][key])     // Empilha o estado da transicao [topoPilha, A]
                    console.log(key + ' -> ' + reduction[key])                               // Mostra na tela a regra reduzida

                    var leng = reduction[key].length
                    if (reduction['rule']) {                                                       // Verifica se tem uma regra semantica associada a regra
                        if( eval('this._semantic.' + reduction['rule'] + '(leng)')  == 'ERROR') {
                            this._semanticError = true
                        }
                    }
                    
                }

                else if (action == 'A') {       // Acao: accept

                    if (!this._semanticError) {
                        this._semantic.save()
                        console.log('\x1b[32m\nprograma.c gerado com sucesso!\x1b[0m')
                    } else {
                        console.log('\x1b[31m\nprograma.c não gerado!\x1b[0m')
                    }

                    return
                }

                else {      // Um erro sintatico ocorreu: chamar rotina de recuperacao de erro
                    this.errorRoutine(args, state)
                    return
                }

            }

            else {
                if (tuple == 'ERROR') {                 // Se a tupla retornada for igual a 'ERROR' um erro lexico aconteceu
                    
                    tuple = this._lexical.getToken()    // Pede a proxima tupla do lexico
                    token = tuple.token                 // Armazena o token da tupla retornada
                
                }
                else {      // Um erro sintatico ocorreu: chamar rotina de recuperacao de erro
                
                    this.errorRoutine(-1, state)
                    return

                }
            }

        }

    }

    errorRoutine(code, state) {
        var token = this._token

        console.log('\x1b[31m')
        console.log('*****')
        console.log('SyntaxError ')  
        console.log(state, token, code)      

        switch (parseInt(code)) {
            case -1:
                console.log('Token inesperado')
                console.log('Token lido: ' + token)
                break

            case 0:
                console.log('Token inesperado. Necessário delimitador *inicio* no começo do programa.')
                console.log('Token lido: ' + token + '    Token esperado: inicio')
                break

            case 3:
                console.log('Token *fim* inesperado. Espera-se um token *fimse*')
                break

            case 9:
                console.log('Token inesperado após *fim*')
                console.log('Token lido: ' + token + '    Token esperado: EOF')
                break

            case 17:
            case 22:
            case 24:
            case 26:
            case 37:
            case 38:
            case 39:
            case 45:
                console.log('Faltando delimitador: ;')
                console.log('Token lido: ' + token + '    Token esperado: PT_V')
                break
            
            case 59:
                console.log('Final de arquivo inesperado. Necessário delimitador *fim* ao final do programa.')
                console.log('Token lido: ' + token + '    Token esperado: Fim')
                break

            case 51:
                console.log('Estrutura incorreta: faltando *varfim*. Espera-se')
                console.log('\nvarinicio\n\tid TIPO;\nvarfim\n')
                console.log('Token lido: ' + token + '    Token esperado: varfim')
                break
            
            case 2:
                console.log('Estrutura incorreta: faltando *varinicio*. Espera-se:')
                console.log('\nvarinicio\n\tid TIPO;\nvarfim\n')
                console.log('Token lido: ' + token + '    Token esperado: varinicio')
                break

            case 60:
                console.log('Estrutura incorreta. Faltando token *escreva*')
                console.log('Token lido: ' + token + '    Token esperado: escreva')
                break

            case 12:
                console.log('Estrutura incorreta')
                console.log('Estrutura esperada: leia ID;')
                break
            
            case 61: 
                console.log('Estrutura incorreta. Faltando token *se*') 
                break       
            
            case 62:
                console.log('Estrutura incorreta. Espera-se:')
                console.log('ID <- Num | ID <- ID | ID <- ID + Num | ID <- ID + ID')  
                break
            
            case 44:
                console.log('Faltando operador aritmético ou operador relacional')
                break

            case 63:
                console.log('Faltando operador de atribuição')
                break
            
            case 14:
                console.log('Falantando *abre parênteses* após *se*')
                break
            
            case 64:
                console.log('Faltando *fecha parênteses*')
                break
            
            case 54:
                console.log('Falando token *então*')
                break
            
            default:
                console.log('Token inesperado')
                console.log('Token lido: ' + token)
                break

           }
        

        console.log('Line ' + this._lexical.getLine() + ' Column ' + this._lexical.getColumn())
        console.log('*****')
        console.log('\x1b[0m')    

    }
}

module.exports = Syntax