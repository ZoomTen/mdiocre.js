"use strict";

const HtmlParser = require("../parsers/HtmlParser");
const BaseParser = require("../parsers/BaseParser");
const VariableManager = require("./VariableManager");

class MDiocre {
    variableManager;
    parser;

    /**
     * Main class to process source files and render HTML files.
     *
     * @param {BaseParser} parser Instance of BaseParser.
     */
    constructor(parser=new HtmlParser()) {
        this.variableManager = new VariableManager();
        this.switchParser(parser);
    }

    /**
     * Switch parsers by using a BaseParser-derived instance.
     *
     * @param  {BaseParser} parser The parser to use.
     * @throws {TypeError}
     */
    switchParser(parser) {
        if (!(Object.getPrototypeOf(parser) instanceof BaseParser))
            throw new TypeError("Parser be an *instance* of a parser that extends BaseParser");
        this.parser = parser;
    }


    /**
     * Process a string into a variable dictionary to use e.g. with render().
     *
     * The string is processed according to a parser that converts it to HTML
     * and extracts any MDiocre “commands”. For Markdown and HTML, these are
     * stuff that is prefixed with <!–:, for RST, it’s :mdiocre:.
     *
     * More details about the conversion process can be found in VariableManager.
     *
     * @param  {string} string A string containing MDiocre commands.
     * @param  {boolean} ignoreContent If True, it will not convert the string to the `content` variable.
     * @param  {VariableManager} variables Variables to inherit from.
     * @returns {VariableManager} A `VariableManager` object containing the processed variables, that also contains the converted HTML under the content variable, if `ignore_content` is false.
     */
    process(string, ignoreContent=false, variables=this.variableManager) {
        this.variableManager =
            this.parser.toVariables(
                string, variables, ignoreContent
            );
        return this.variableManager;
    }


    /**
     * Renders a template with the specified variables.
     *
     * Due to the mechanism, template variables are separate from the page’s
     * variables. The converted page is defined in the content variable, and can
     * be used by templates to render the documents.
     *
     * @param  {string} template A string containing formatted comments.
     * @param  {VariableManager} variables Variables to inherit from.
     * @returns {string} The processed string.
     */
    render(template, variables=this.variableManager) {
        let page_renderer = new VariableManager();
        return this.process(template, false, variables).get("content")
    }
}

module.exports = MDiocre;
