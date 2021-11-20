"use strict";

// import the MDiocre module
const mdiocre = require("mdiocre");

// load in the markdown parser
const MarkdownParser = require("mdiocre-parser-markdown");

// set our source and destination directories
const SOURCE_DIR = "example/src";
const DEST_DIR   = "example/build";

// generate our pages
mdiocre.wizard.generateFromDirectory(
    "example/src",
    "example/build"
);

// (Optional) generate a blog index
const fs = require("fs");
const md = new mdiocre.core(new MarkdownParser());
let template = `
<!--: mdiocre-template = "../_template/subdirs.html" -->
<!--: title = "Blog Index" -->

## <!--: title -->

`
fs.promises.readdir(SOURCE_DIR + "/blog").then((list) => {
    for (var i of list) {
        // only process files that are markdown
        if (i.toLowerCase().endsWith(".md")) {
            // generate the built file name
            const file_name = i.replace(/\.md$/i, ".html");
            // complete the source file name
            i = SOURCE_DIR + "/blog/" + i;
            // process the thing so we can get the variables
            let vars = md.process(fs.readFileSync(i, "utf8"));
            vars.get("date")
            vars.get("title")
            // insert an entry into our template
            template += `* ${vars.get("date")} - [${vars.get("title")}](${file_name})\n`;
        }
    }
    // render it using the MD parser to BUILT/blog/index.html
    mdiocre.wizard.mdiocre.switchParser(new MarkdownParser());
    fs.writeFileSync(
        DEST_DIR + "/blog/index.html",
        mdiocre.wizard.generateFromString(template, SOURCE_DIR)
    );
    mdiocre.info.built(DEST_DIR + "/blog/index.html");
});
