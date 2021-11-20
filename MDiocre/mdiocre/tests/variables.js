"use strict";

const VariableManager = require("../lib/VariableManager");
const Test = require("../lib/Test");

let vm = new VariableManager();

Test.reset();
Test.add("Getting non-existent key",
    ()=> vm.get("qqwuhfiwefiuhwvefrh"),
    ""
);

Test.add("Generated timestamp must be a date object",
    ()=> vm.get("mdiocre-gen-timestamp") instanceof Date,
    true
);

Test.add("Assignment of a single variable with string", ()=>
    {
        vm.assign("hello = 'world'");
        return vm.get("hello");
    },
    "world"
);

Test.add("Variable concatenation (variable + string)", ()=>
    {
        vm.assign("hello2 = hello, '2'");
        return vm.get("hello2");
    },
    "world2"
);

Test.add("Variable concatenation (all strings, different quotations)", ()=>
    {
        vm.assign("hello3 = \"a\", 'b', \"c\"");
        return vm.get("hello3");
    },
    "abc"
);

Test.run("VariableManager");
