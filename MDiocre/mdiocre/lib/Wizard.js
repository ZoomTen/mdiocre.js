"use strict";

const path = require("path");
const fs = require("fs");
const MDiocre = require("./MDiocre");
const Info = require("./Info");

const BaseParser = require("../parsers/BaseParser");
const HtmlParser = require("../parsers/HtmlParser");

class Wizard {
    static mdiocre = new MDiocre();

    static file_types = {
        html: HtmlParser,
        xhtml: HtmlParser
    };

    static asset_file_types = [
        "css",
        "jpg",
        "png"
    ]

    /**
     * Determines whether or not this is valid MDiocre-formatted markdown.
     * The only criteria currently needed for this is whether or not it contains a `mdiocre-template` variable.
     * @static
     * @param  {string} md_string The formatted text to validate.
     * @returns {string} The template, if it is a valid string, an empty string otherwise.
     */
    static isMdiocreString(md_string) {
        this.mdiocre.variableManager.clearAll();
        return this.mdiocre.process(md_string).get("mdiocre-template");
    }

    /**
     * Given a MDiocre string and a “root” path, convert it to a proper HTML document.
     *
     * The HTML template itself is obtained from the presence of the `mdiocre_template` variable,
     * which simply contains the path of the template file relative to the root set here.
     *
     * Which is why the `mdiocre-template` variable must be present for the
     * markdown to be considered convertable by MDiocre.
     * @static
     * @param  {string} md_string The markdown-formatted text to convert.
     * @param  {string} root      The ‘root’ path.
     * @returns {string} A rendered HTML string. If `md_string` is invalid or if it cannot find the template file, it will return an empty string.
     */
    static generateFromString(md_string, root){
        const template_dir = this.isMdiocreString(md_string);
        if (template_dir === "") return "";

        // check if the template actually exists
        const template_file = path.resolve(
                root,
                template_dir
        );
        let has_file = false;
        try {
            fs.accessSync(
                template_file,
                fs.constants.F_OK | fs.constants.R_OK
            );
            has_file = true;
        } catch (e) {}

        // exit if we don't
        if (!has_file)
            return "";

        // assume that all templates will be in HTML
        this.mdiocre.switchParser(new HtmlParser());
        try {
            return this.mdiocre.render(
                fs.readFileSync(template_file, "utf8")
            );
        } catch(e) {
            Info.error(e.stack);
        }
    }

    /**
     * If the file is a MDiocre file, generate an HTML page from a source file
     * to a built file. Otherwise, simply copy the file.
     *
     * @static
     * @param  {string} source_file
     * @param  {string} built_file The target file, which will either retain its file extension or have "html" at the end if it's processable by MDiocre (no matter what it is)
     * @param  {string} root The root directory from which to find `mdiocre-template`.
     * @returns If it's not an asset or a file not considered by MDiocre, the processed file. Otherwise, it's simply copied.
     * @throws {Error} If the file does not have dots in them.
     */
    static generateFromPath(source_file, built_file, root) {
        // try to get ".jpg" from "qwerty.avi.mp3.txt.jpg"
        const get_file_type = (file_name) => {
            let ft_test =  /\.(\w+)$/.exec(file_name);
            return (
                ft_test
                ? ft_test[1]
                : null
            );
        };
        const source_type = get_file_type(source_file).toLowerCase();

        if (!(typeof source_type === "string"))
            throw new Error("Source file doesn't have a file type?");

        // asset file types are ALWAYS copied
        if (this.asset_file_types.includes(source_type)) {
            Info.asset(`${source_file} -> ${built_file}`);
            return fs.copyFileSync(source_file, built_file);
        }

        // switch parser according to its filetype
        if (source_type in this.file_types) {
            this.mdiocre.switchParser(
                new this.file_types[source_type]()
            );
        } else {
            Info.warn(`${source_file} not a MDiocre file, copying instead to ${built_file}`);
            return fs.copyFileSync(source_file, built_file);
        }

        // test if mdiocre renders
        const rendered = this.generateFromString(
            fs.readFileSync(source_file, "utf8"),
            root
        )

        // if we have nothing, just copy the file
        if (rendered === "") {
            Info.warn(`${source_file} not a MDiocre file, copying instead to ${built_file}`);
            return fs.copyFileSync(source_file, built_file);
        }

        // the built file will have a .html at the end
        built_file = built_file.replace(/\.\w+$/, ".html")
        Info.built(`${source_file} -> ${built_file}`);
        try {
            return fs.writeFileSync(built_file, rendered);
        } catch (e) {
            Info.error(e.stack);
        }
    }

    /**
     * Generates pages based on the directory it is supplied through args.
     *
     * This function looks at the files inside the `src_dir` path recursively
     * and copies the files to build_dir, or generates a page if it is a
     * MDiocre file (see `isMdiocreString()`).
     *
     * In order to generate pages, it needs a template. The template file is
     * supplied through each file’s `mdiocre-template` variable, and it is
     * relative to `src_dir`.
     *
     * @static
     * @param  {string} src_dir
     * @param  {string} build_dir
     * @param  {string} root
     * @returns Generated files within the specified `build_dir`.
     */
    static async generateFromDirectory(src_dir, build_dir, root=src_dir) {
        for (var i of await fs.promises.readdir(src_dir)){
            const file_path = path.join(src_dir, i);
            const build_path = path.join(build_dir, i);

            try {
                await fs.promises.mkdir(build_dir, {recursive: true});
            } catch(e) {};

            const stat = await fs.promises.stat(file_path);
            if (stat.isDirectory()) {
                this.generateFromDirectory(
                    file_path,
                    path.join(build_dir, i),
                    root
                );
            } else {
                this.generateFromPath(file_path, build_path, root);
            }
        }
    }

    /**
     * Registers a parser for use with MDiocre. This parser must contain a
     * toVariables() method that returns a VariableManager object.
     *
     * @static
     * @param  {string} type The file type to register this parser with.
     * @param  {BaseParser} parser The parser to use.
     * @throws {TypeError}
     */
    static registerParser(type, parser) {
        if (!(parser.prototype instanceof BaseParser))
            throw new TypeError("Parser to register must be a *class* that extends BaseParser");
        this.file_types[type] = parser;
    }

    /**
     * Adds an asset filetype. Files of this type will always be copied onto
     * the build directory, no matter what. (unfinished)
     * @static
     * @param  {Array|string} ...type
     * @returns {Array}
     */
    static addAssetType(...type) {
        if (Object.prototype.toString.call(...type) === "[object Array]")
            return this.asset_file_types.push.apply(this.asset_file_types, ...type);
        return asset_file_types.push(...type)
    }
}

module.exports = Wizard;
