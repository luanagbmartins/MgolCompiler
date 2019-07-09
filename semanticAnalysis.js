const fs = require('fs')

class Semantic {

    constructor (lex) {

        this._tempCount = 0
        this._lexical = lex
        this._stack = []

        this._output = {
            header: [
                '#include<stdio.h>',
                'typedef char literal[256];',
                'int main() {' 
            ],
            tempVars: [
                '/*----Variaveis temporarias----*/'
            ],
            vars: [
                '/*------------------------------*/'
            ],
            code: [

            ],
            end: [
                '',
                'return 0;',
                '}'
            ]
        }

    }

    save () {

        fs.open('programa.c', 'w', function(err, file) {
            if(err) throw err;
        })
        

        for (var it = 0; it < this._output.header.length; it++) {
            fs.appendFileSync('programa.c', this._output.header[it], function (err) {
                if (err) throw err;
            });
            fs.appendFileSync('programa.c', '\n', function (err) {
                if (err) throw err;
            });
        }        

        for (var it = 0; it < this._output.tempVars.length; it++) {
            fs.appendFileSync('programa.c', this._output.tempVars[it], function (err) {
                if (err) throw err;
            });
            fs.appendFileSync('programa.c', '\n', function (err) {
                if (err) throw err;
            });
        } 

        for (var it = 0; it < this._output.vars.length; it++) {
            fs.appendFileSync('programa.c', this._output.vars[it], function (err) {
                if (err) throw err;
            });
            fs.appendFileSync('programa.c', '\n', function (err) {
                if (err) throw err;
            });
        } 

        for (var it = 0; it < this._output.code.length; it++) {
            fs.appendFileSync('programa.c', this._output.code[it], function (err) {
                if (err) throw err;
            });
            fs.appendFileSync('programa.c', '\n', function (err) {
                if (err) throw err;
            });
        } 

        for (var it = 0; it < this._output.end.length; it++) {
            fs.appendFileSync('programa.c', this._output.end[it], function (err) {
                if (err) throw err;
            });
            fs.appendFileSync('programa.c', '\n', function (err) {
                if (err) throw err;
            });
        } 
        
    }

    newTemp (type) {

        var varTemp = 'T' + this._tempCount.toString() 
        this._output['tempVars'].push(type + ' ' + varTemp + ';')
        this._tempCount += 1
        return varTemp

    }

    
    rule5 () {

        this._output['vars'].push('')
        this._output['vars'].push('')
        this._output['vars'].push('')

    }

    rule6 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())

        symbolTable[stack[1].lexeme].type = stack[1].type
        var output = stack[1].type + ' ' + stack[1].lexeme + ';'
        this._output['vars'].push(output)     

    }

    rule7 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        this._stack[this._stack.length - 1].type = symbolTable['inteiro'].type
        
    }

    rule8 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        this._stack[this._stack.length - 1].type = symbolTable['real'].type
        
    }

    rule9 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        this._stack[this._stack.length - 1].type = symbolTable['lit'].type
        
    }

    rule11 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())

        var id = stack[1]
        if (id.type == 'literal') {
            this._output['code'].push('scanf("%s", ' + id.lexeme + ');')
        } else if (id.type == 'int') {
            this._output['code'].push('scanf("%d", &' + id.lexeme + ');')
        } else if (id.type == 'double') {
            this._output['code'].push('scanf("%lf", &' + id.lexeme + ');')
        } else {
            this.errorRoutine(0, id.lexeme)
            return 'ERROR'
        }

    }

    rule12 (ruleLength) {
        
        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        
        var arg = stack[1]
        this._output['code'].push('printf( ' + arg.lexeme + ');')    

    }

    rule13 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        this._stack.push({'lexeme': stack[0].lexeme})

    }

    rule14 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        var arg = '%lf, ' + stack[0].lexeme
        this._stack.push({'lexeme': arg})

    }

    rule15 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())

        var arg = ''     
                
        if (stack[0].type == 'literal') {
            arg = '"%s", ' + stack[0].lexeme
        } else if (stack[0].type == 'int') {
            arg = '"%d", ' + stack[0].lexeme
        } else if (stack[0].type == 'double') {
           arg = '"%lf", ' + stack[0].lexeme 
        } else {
            this.errorRoutine(0, stack[0].lexeme)
            return 'ERROR'
        }

        this._stack.push({'lexeme': arg})

    }

    rule17 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
  
        var id = stack[3]
        var rcb = stack[2]
        var ld = stack[1]

        if (id.type == null) {
            this.errorRoutine(0, id.lexeme)
            return 'ERROR'
        } else if(ld.type == null) {
            this.errorRoutine(0, ld.lexeme)
            return 'ERROR'
        } else if(id.type == ld.type) {
            this._output['code'].push(id.lexeme + rcb.type + ld.lexeme + ';')
        } else {
            this.errorRoutine(1, id.lexeme, ld.lexeme, id.type, ld.type)
            return 'ERROR'
        }

    }

    rule18 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())

        var oprd1 = stack[0]
        var opm = stack[1]
        var oprd2 = stack[2]

        if (oprd1.type == oprd2.type && oprd1.type != 'literal') {
            var temp = this.newTemp(oprd1.type)
            var atr = temp + ' = ' + oprd1.lexeme + opm.type + oprd2.lexeme + ';' 
            this._output['code'].push(atr)
            this._stack.push({
                'lexeme': temp,
                'type': oprd1.type
            })

        } else {
            this.errorRoutine(2, oprd1.lexeme, oprd2.lexeme, oprd1.type, oprd2.type)
            return 'ERROR'
        }

    }

    rule19 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        
        this._stack.push(stack[0])
    }

    rule20 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        
        if (stack[0].type == null) {
            this.errorRoutine(0, stack.lexeme)
            return 'ERROR'
        } else {
            this._stack.push(stack[0])
        }

    }

    rule21 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        
        this._stack.push(stack[0])

    }

    rule23 () {

        this._output['code'].push('}')

    }

    rule24 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        
        var cond = 'if(' + stack[2].lexeme + ') {'
        this._output['code'].push(cond)
        
    }

    rule25 (ruleLength) {

        var stack = []
        for (var it = 0; it < ruleLength; it++) stack.push(this._stack.pop())
        
        var oprd1   = stack[2]
        var opr     = stack[1]
        var oprd2   = stack[0]

        if (((oprd1.type == 'int' || oprd1.type == 'double') && (oprd2.type == 'int' || oprd2.type == 'double')) 
                || (oprd1.type == oprd2.type && (opr.lexeme == '=' || opr.lexeme == '<>'))) 
        {

            var temp = this.newTemp('int')
            var expr = temp + '=' + oprd1.lexeme + opr.type + oprd2.lexeme + ';'
            this._output['code'].push(expr)

            this._stack.push({
                'lexeme': temp,
                'type': 'int'
            })

        } else {
            this.errorRoutine(2, oprd1.lexeme, oprd2.lexeme, oprd1.type, oprd2.type)
            return 'ERROR'
        }

    }

    errorRoutine (type, var1, var2, type1, type2) {
        console.log('\x1b[31m')
        console.log('*****')
        console.log('SemanticError')
            
        switch(type) {
            case 0:
                console.log('Variável ' + var1 + ' não declarada')
                break
            case 1:
                console.log('As variáveis ' + var1 + ' e ' + var2 + ' possuem tipos diferentes para atribuição')
                console.log('(' + var1 + ').type = ' + type1 + '\t(' + var2 + ').type = ' + type2 ) 
                break
            case 2:
                console.log('Operandos' + var1 +' e ' + var2 + 'com tipos incompativeis')
                console.log('(' + var1 + ').type = ' + type1 + '\t(' + var2 + ').type = ' + type2 ) 
                break
        }

        console.log('Linha: ' + this._lexical.getLine() + '  Coluna: ' + this._lexical.getColumn())
        console.log('*****')
        console.log('\x1b[0m')

    }

}

module.exports = Semantic