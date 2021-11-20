"use strict";

const process = require ("process");

let colors = {
    reset: "\x1b[0m",
    red: "\x1b[1m\x1b[31m",
    yellow: "\x1b[1m\x1b[33m",
    white: "\x1b[1m\x1b[37m",
    green: "\x1b[1m\x1b[32m",
    pink: "\x1b[1m\x1b[35m",
    clear_line: "\x1b[2K"
}

if (!(process.stdout.isTTY)) {
// no ANSI if not a TTY
    let i;
    for (i in colors) {
        colors[i] = "";
    }
}

class Info {
    static MessageTypes = {
        ASSET: {
            name: "asset",
            ansi: colors.pink,
            command: console.log
        },
        BUILT: {
            name: "built",
            ansi: colors.green,
            command: console.log
        },
        SUCCESS: {
            name: "ok",
            ansi: colors.green,
            command: console.log
        },
        FAIL: {
            name: "no",
            ansi: colors.red,
            command: console.error
        },
        ERROR: {
            name: "error",
            ansi: colors.red,
            command: console.error
        },
        INFO: {
            name: "info",
            ansi: colors.white,
            command: console.log
        },
        WARN: {
            name: "warn",
            ansi: colors.yellow,
            command: console.warn
        }
    };

    static options = {
        echo: true
    }

    static messages = [];

    static pushMessage(type, text) {
        let message_type = this.MessageTypes.INFO;

        if (type in this.MessageTypes)
            message_type = this.MessageTypes[type]

        this.messages.push(
            {
                kind: {
                    name: message_type.name
                },
                message: text
            }
        );

        if (this.options.echo)
            return message_type.command(
                message_type.ansi
                + `[${message_type.name}] `
                + text
                + colors.reset
            );

        return this.messages;
    }
    static error(text) { return this.pushMessage("ERROR", text) }
    static info(text) { return this.pushMessage("INFO", text) }
    static built(text) { return this.pushMessage("BUILT", text) }
    static asset(text) { return this.pushMessage("ASSET", text) }
    static warn(text) { return this.pushMessage("WARN", text) }
    static success(text) { return this.pushMessage("SUCCESS", text) }
    static fail(text) { return this.pushMessage("FAIL", text) }
}

module.exports = Info;
