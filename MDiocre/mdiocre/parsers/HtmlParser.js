"use strict";

const CONSTANTS = require("../constants");
const BaseParser = require("./BaseParser");

const RE = CONSTANTS.RE;

class HtmlParser extends BaseParser {
    #COMMENTS_RE = /<!--:(.+?)-->/mg;

    toVariables(text, v, ignoreContent=false) {
        super.toVariables.call(this, text, v, ignoreContent)

        function matchComment(original, captured) {
            if (RE.ASSIGNMENT.exec(captured)) {
                v.assign(captured);
                return '';
            }
            return v.get(captured.trim());
        }

        const content = text.replaceAll(this.#COMMENTS_RE, matchComment).trim();

        if (ignoreContent) return v;

        v.variables.content = content
        return v;
    }
}

module.exports = HtmlParser;
