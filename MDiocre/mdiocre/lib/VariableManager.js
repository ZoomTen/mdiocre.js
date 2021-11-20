"use strict";

const CONSTANTS = require("../constants");

const RE = CONSTANTS.RE;

class VariableManager {
    variables = {};

    #RESERVED_VARIABLES = [
        "content",
        "mdiocre-gen-timestamp"
    ];

    constructor(){
        this.variables["mdiocre-gen-timestamp"] = new Date();
    }

    clearAll() {
        this.variables = {}
    }
    
    get(key) {
        return (
            (key in this.variables)
            ? this.variables[key]
            : ""
        );
    }

    assign(query) {
        const matches = RE.ASSIGNMENT.exec(query);

        if (matches === null)
            throw new SyntaxError();

        const assign = {
            lhs: matches[1].trim(),
            rhs: matches[2].trim()
        }

        let concat_args, initial_variable = "";

        while ((concat_args = RE.CONCAT.exec(assign.rhs)) !== null) {
            let arg = (concat_args[1] || concat_args[2]);
            if (
                (arg[0] === `"` && arg.endsWith(`"`)) ||
                (arg[0] === `'` && arg.endsWith(`'`))
            ) {
                // this is a string
                initial_variable += arg.substring(1, arg.length-1);
            } else {
                // assume this is a variable
                if (arg in this.variables)
                    initial_variable += this.variables[arg];
            }
        }

        this.variables[assign.lhs] = initial_variable;
    }
}

module.exports = VariableManager;
