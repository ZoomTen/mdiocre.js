"use strict";

module.exports = {
    RE: {
        ASSIGNMENT: /\s*(.+)\s*=\s*(.+)\s*/,
        CONCAT: /(\"[^\"]*\"|\'[^\']*\'|\w+|\(.+\)),\s*|(\"[^\"]*\"|\'[^\']*\'|\w+|\(.+\))$/gm,
        ESCAPE: /(\\)(.{1})/,
    }
}
