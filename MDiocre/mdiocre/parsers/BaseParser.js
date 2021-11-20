"use strict";

const VariableManager = require("../lib/VariableManager");

class BaseParser {
    toVariables(text, v, ignoreContent=false) {
        // this base class does nothing but checks
        if (!(v instanceof VariableManager))
            throw new TypeError("Second parameter must be a VariableManager");
    }
}

module.exports = BaseParser;
