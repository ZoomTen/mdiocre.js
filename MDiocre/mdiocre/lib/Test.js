"use strict";

const Info = require("../lib/Info");
const process = require("process");

class Test {
    static #tests = [];

    static reset() {
        this.#tests = [];
    }

    static add(test_name, func, must_equal) {
        if (!(typeof test_name === "string"))
            throw new TypeError("Name parameter must be a string");
        if (!(typeof func === "function"))
            throw new TypeError("Function parameter must be, well, a function");

        this.#tests.push({
            name: test_name,
            func: func,
            equal: must_equal
        });
    }

    static run(title) {
        Info.info(`Starting tests for "${title}"`);

        if (this.#tests.length < 1)
            return Info.error("No tests?");

        let passed_tests = 0;

        const start = process.hrtime.bigint();
        for (
            let i = 0, test;
            test = this.#tests[i];
            i++
        ) {
            try {
                const result = test.func();
                if (result === test.equal) {
                    passed_tests += 1;
                    Info.success(test.name);
                } else {
                    Info.fail(test.name + `\n\texpected:  ${test.equal}\n\tactually:  ${result}`);
                }
            } catch (e) {
                Info.error(`(${test.name}) ${e.stack}`);
            }
        }

        const end = process.hrtime.bigint();

        let level = "WARN";
        if (passed_tests >= this.#tests.length * 0.5) {
            level = "INFO";
        }
        if (passed_tests == this.#tests.length) {
            level = "SUCCESS";
        }

        let length_as_str = (end-start).toString();
        length_as_str = (
            length_as_str.substring(
                1,
                length_as_str.length-6
            )
            + "." +
            length_as_str.substring(
                length_as_str.length-6,
                length_as_str.length-4
            )
        );

        Info.pushMessage(level, `${passed_tests} / ${this.#tests.length} tests passed (${length_as_str} ms)`);
        console.log();
    }
}

module.exports = Test;
