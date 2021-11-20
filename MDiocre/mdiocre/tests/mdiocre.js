"use strict";

const MDiocre = require("../lib/MDiocre");
const Test = require("../lib/Test");

let md = new MDiocre();

Test.reset();
Test.add("Process variables", ()=>{
    md.process(
        "<!--: hello = 'lol' --><!--: lol = 'asdf' --><h1><!--: hello --> / <!--: lol --></h1>",
    );

    return (
        md.variableManager.variables.content === "<h1>lol / asdf</h1>"
    );
}, true);

Test.add("Render a page based on process variables", ()=>{
    return md.render(
        "<!DOCTYPE html><html><head><title>Testing</title></head><body><!--: content --></body></html>",
    );
}, "<!DOCTYPE html><html><head><title>Testing</title></head><body><h1>lol / asdf</h1></body></html>");

Test.run("MDiocre Core");
