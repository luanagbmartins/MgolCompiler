const fs = require ('fs')
const dt = require('./auxFunctions')
const csvConverter = require('convert-csv-to-json');

class Lexical {

    constructor(fileName) {

        this._file = dt.openFile(fileName)                                                          // Abre arquivo de leitura
        this._states = csvConverter.fieldDelimiter(',').getJsonFromCsv('./transitionTable.csv')     // Pega tabela de transicao do DFA
        this._currentState = 0                                                                      // Estado atual
        this._currentCharacter = 0                                                                  // Iterador de leitura do arquivo de leitura
        this._finalStates = {1: 'Num', 3: 'Num', 7:'Literal', 8:'ID', 10:'Comentario',              // Estados Finais do DFA
                             11:'OPR', 12:'RCB', 13:'OPR', 14:'OPR', 15:'OPM', 
                             16:'AB_P', 17:'FC_P', 18:'PT_V', 19:'EOF', 20:'ERROR'}
        this._line = 1                                                                              // Linha do arquivo de leitura
        this._column = 1                                                                            // Coluna do arquivo de leitura
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
            
            // Contador de linha e coluna
            if (char == '\n') {
                this._line ++
                this._column = 1
            } else if (char != '\r') {
                this._column ++
            }

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
                    this._column --

                    // Se o estado final é ID, adiciona o token e o lexema na tabela de simbolos 
                    // (somente se o token e o lexema não estiverem presentes da tabela de simbolos)
                    if (final == 'ID' && !symbolTable[buffer]) {
                        symbolTable[buffer] = {token: final, lexeme: buffer, type: null}
                    }
    
                    return {token: final, lexeme: buffer, type: null}
                } 

                // Se não é estado final, um erro ocorreu e a rotina de erro é chamada para mostrar o erro
                // this._currentCharacter é incrementado para continuar a análise léxica
                else {

                    this._currentCharacter ++
                    buffer = buffer + char
                    if (this.errorRoutine(char, buffer) == 'EOF') 
                        return {token: 'EOF', lexeme: 'eof', type: null}  
                    else return 'ERROR'

                } 

            } 
            
            // Se há uma transição, continua a leitura de caracteres
            // this._currentCharacter é incrementado para continuar a análise léxica
            else {

                this._currentCharacter ++

                // Para ignorar espaco/tab/nova-linha no buffer de leitura
                if (this._currentState == 6 || this._currentState == 9) buffer = buffer + character
                else if (char != '-stn') buffer = buffer + char

            }
        }       

    }

    lexicalDFA(character) {

        // Pega o proximo estado do automato se tiver transicao
        // Se nao tiver transicao, o estado atual eh vazio
        var tempState
        

        // Se o estado atual for 6 ou 9, o lexema pode ser um literal ou um comentario
        // Nesse caso, pode-se ler qualquer simbolo (menos o 'eof') ate ler uma aspas ou fecha chaves
        // Portanto, ignorar tabela de transicao ate encontrar uma aspas ou fecha chaves          
        if((this._currentState == 6 || this._currentState == 9) && character != 'eof') {

            if (character == '"' || character == '}')  
                tempState = this._states[this._currentState][character.toLowerCase()]
            else tempState = 6

        } else if (this._currentState != 6 && this._currentState != 9) {        
            tempState = this._states[this._currentState][character.toLowerCase()]
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

            if(this._currentState == 6) {
                console.log('Aspas (") foram abertas e não foram fechadas')

            } else if(this._currentState == 9) {
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