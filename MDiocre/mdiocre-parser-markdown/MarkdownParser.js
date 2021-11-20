"use strict";

const marked = require("marked");
const CONSTANTS = require("mdiocre/constants");
const BaseParser = require("mdiocre/parsers/BaseParser");
const Wizard = require("mdiocre/lib/Wizard");

const RE = CONSTANTS.RE;

class MarkdownParser extends BaseParser {
    #COMMENTS_RE = /<!--:(.+?)-->/mg;

    toVariables(text, v, ignoreContent=false) {
        super.toVariables.call(this, text, v, ignoreContent)

        function matchComment(original, captured) {
            if (RE.ASSIGNMENT.exec(captured)) {
                v.assign(captured);
                return "";
            }
            return v.get(captured.trim());
        }

        const content = text.replaceAll(this.#COMMENTS_RE, matchComment).trim();

        if (ignoreContent) return v;

        v.variables.content = marked.parse(content);
        return v;
    }
}

Wizard.registerParser("md", MarkdownParser);

module.exports = MarkdownParser;
