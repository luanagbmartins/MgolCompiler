const fs = require ('fs')
const csvConverter = require('convert-csv-to-json');

class Lexical {

    constructor(fileName) {

        this._file = openFile(fileName)                                                             // Abre arquivo de leitura
        this._states = csvConverter.fieldDelimiter(',').getJsonFromCsv('./transitionTable.csv')     // Pega tabela de transicao do DFA
        this._currentState = 0                                                                      // Estado atual
        this._currentCharacter = 0                                                                  // Iterador de leitura do arquivo de leitura
        this._finalStates = { 1: 'Num', 4: 'Num',5:'Num', 9:'Num', 11:'Literal', 12:'ID',           // Estados Finais do DFA
                             14:'Comentario', 15:'OPR', 16:'RCB', 17:'OPR', 18:'OPR', 
                             19:'OPM', 20:'AB_P', 21:'FC_P', 22:'PT_V', 23:'EOF'}
        this._line = 1                                                                              // Linha do arquivo de leitura
        this._column = 1                                                                            // Coluna do arquivo de leitura
        this._prevLine = 1                                                                          // Linha do arquivo de leitura do token anterior
        this._prevColumn = 1                                                                        // Coluna do arquivo de leitura do token anterior
        this._wasFinal = false                                                                      // Flag de verificação de estado final

    }

    getLine() {

        return this._prevLine

    }

    getColumn() {

        return this._prevColumn

    }

    increment(character) {

        this._currentCharacter ++

        if (character == '\n') {
            this._line ++
            this._column = 1
        }
        else this._column ++
        
    }

    getToken() {

        this._currentState = 0      // Reinicia maquina de estados
        var buffer = ''             // Inicializa buffer de leitura

        while (true) {

            // Le proximo caracter do arquivo. Se character for falso/undefined, 
            // houve uma tentativa de acesso a uma posição maior que this._file.length
            // portanto chegou-se ao final do arquivo
            var character = this._file[this._currentCharacter]     
            var char = character
            if (!character) char = 'eof'
            
            // Se o caracter lido for um espaço, um tab, uma nova linha ou um retorno de carro
            if (char == ' ' || char == '\t' || char == '\n' || char == '\r')
                char = '-stn'
            
            // Verifica se ha transicao no DFA com o character lido
            var transition = this.lexicalDFA(char)

            // Se nao ha uma transicao
            if(!transition) {
                
                // Verifica se o estado atual é final
                var final = this._finalStates[this._currentState]
                
                // E o estado atual é final, retorna token
                if (final) {
                    this._wasFinal = true
                    var tuple = {lexeme: buffer, token: final, type: null}

                    // Se o estado final é ID, adiciona o token e o lexema na tabela de simbolos 
                    // (somente se o token e o lexema não estiverem presentes da tabela de simbolos)
                    if (final == 'ID') {

                        if(!symbolTable[buffer]) symbolTable[buffer] = tuple
                        return symbolTable[buffer]

                    }

                    if (final == 'OPM') {

                        tuple.type = buffer

                    } else if (final == 'OPR') {

                        if (buffer == '<>')         tuple.type = '!='
                        else if (buffer == '=')     tuple.type = '=='
                        else                        tuple.type = buffer

                    } else if (final == 'RCB') {

                        tuple.type = '='

                    } else if (final == 'Literal') {

                        tuple.type = final

                    } else if (this._currentState == 1 || this._currentState == 5) {

                        tuple.type = 'int'

                    } else if (this._currentState == 4 || this._currentState == 9) {

                        tuple.type = 'double'

                    }
    
                    return tuple
                } 

                // Se não é estado final, um erro ocorreu e a rotina de erro é chamada para mostrar o erro
                // this._currentCharacter é incrementado para continuar a análise léxica
                else {

                    this.increment(character)
                    buffer = buffer + char

                    if (this.errorRoutine(char, buffer) == 'EOF') 
                        return {token: 'EOF', lexeme: 'eof', type: null}  

                    else return 'ERROR'

                } 

            } 
            
            // Se há uma transição, continua a leitura de caracteres
            // this._currentCharacter é incrementado para continuar a análise léxica
            else {

                if (this._wasFinal) {

                    this._prevLine = this._line
                    this._prevColumn = this._column
                    this._wasFinal = false

                }

                this.increment(character)

                // Para ignorar espaco/tab/nova-linha no buffer de leitura
                if (this._currentState == 10 || this._currentState == 13) buffer = buffer + character
                else if (char != '-stn') buffer = buffer + char

            }
        }       

    }

    lexicalDFA(character) {

        // Pega o proximo estado do automato se tiver transicao
        // Se nao tiver transicao, o estado atual eh vazio
        var tempState
        
        // Se o estado atual for 10 ou 13, o lexema pode ser um literal ou um comentario
        // Nesse caso, pode-se ler qualquer simbolo (menos o 'eof') ate ler uma aspas ou fecha chaves
        // Portanto, ignorar tabela de transicao ate encontrar uma aspas ou fecha chaves          
        if((this._currentState == 10 || this._currentState == 13) && character != 'eof') {

            if (character == '"' || character == '}')  
                tempState = this._states[this._currentState][character.toLowerCase()]
            else tempState = 10

        } else if (this._currentState != 10 && this._currentState != 13) { 

            try {
                tempState = this._states[this._currentState][character.toLowerCase()]
            } catch(e) {
                tempState = null
            }     
            
        }

        // ************************************************************************************              

        if (!tempState) {       // Se nao houver transicao
            return false
        }  else {       // Se ha uma transicao, continua lendo o lexema
            this._currentState = tempState
            return true
        }    
    }

    errorRoutine(c) {
        
        if (c == 'eof' && this._currentState != 0) {

            console.log('\x1b[31m')
            console.log('*****')
            console.log('LexicalError: final de arquivo inesperado')

            if(this._currentState == 10) {

                console.log('Aspas (") foram abertas e não foram fechadas')

            } else if(this._currentState == 13) {

                console.log('Um abre-chave ({) foi aberto e não foi fechado')

            }
                
            console.log('*****')
            console.log('\x1b[0m')

            return 'EOF'
        } 
        else if (this._currentState == 0) {

            console.log('\x1b[31m')
            console.log('*****')
            console.log('LexicalError: Caracter -- ' + c + ' -- inválido')
            console.log('Linha: ' + this._line + '  Coluna: ' + this._column)
            console.log('*****')
            console.log('\x1b[0m')

            return 'ERROR'      
        }  
        else {

            console.log('\x1b[31m')
            console.log('*****')
            console.log('LexicalError: Caracter -- ' + c + ' -- inesperado ou inválido')
            console.log('Linha: ' + this._line + '  Coluna: ' + this._column)
            console.log('*****')
            console.log('\x1b[0m')

            return 'ERROR'  

        }

    }
}

module.exports = Lexical

function openFile (fileName) {

    try {
      var data = fs.readFileSync(fileName, 'utf8')
    } catch(e) {
      console.log('\x1b[31mError ao ler ' + fileName + ' :\n\x1b[0m', e.stack)
    }
    return data
    
  }