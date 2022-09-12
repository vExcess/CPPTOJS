// compiles C++ code to ASM.JS using JavaScript
function CPPTOJS (code) {
    var JSCode = ""; // result of transpilation

    var i = 0, cc = ""; // index of cursor in code

    // store some other stuff
    var inString = false, inSingleLineComment = false;

    // store code line number
    var lineNum = 1;

    var dataTypes = "int long char float double bool auto short".split(" ");

    // functions for manipulation code
    function is (a, off) {
        off = off || 0;
        if (a.length > 1) {
            return code.slice(i + off, i + off + a.length) === a;
        } else {
            return code.charAt(i + off) === a;
        }
    }

    function insert (idx, txt) {
        idx--;
        code = code.slice(0, idx) + txt + code.slice(idx);
    }

    function del (idx, amt) {
        code = code.slice(0, idx) + code.slice(idx + amt);
    }

    function idxOfNext (txt) {
        var idx = code.slice(i).indexOf(txt);
        return idx === -1 ? code.length : i + idx;
    }

    while (i < code.length) {
        // the current character
        cc = code.charAt(i);

        // update whether cursor is in string
        if (is('"')) {
            inString = !inString;
        }

        // store line count; also needed for tracking single line comments
        if (is("\n")) {
            lineNum++;
            inSingleLineComment = false;
        }

        // the meat and potatos of the parser
        if (!inString && !inSingleLineComment) {
            // update if in single line comment
            if (is("/") && is("\n", 1)) {
                inSingleLineComment = true;
            }

            // lets change imports to comments
            if (is("#")) {
                cc = "//";
            }

            // parse at data types
            for (var j = 0; j < dataTypes.length; j++) {
                var dataType = dataTypes[j];

                if (is(dataType) || is("static_cast<" + dataType + ">")) {
                    var isStaticCast = false
                    if (is("static_cast<" + dataType + ">")) {
                        isStaticCast = true;
                    }

                    if (idxOfNext("(") < idxOfNext(";") && idxOfNext("(") < idxOfNext("=") && code.slice(i, idxOfNext("(")).includes(" ")) {
                        cc = "function";
                        i += dataType.length - 1;
                    } else if (code.slice(i, idxOfNext(";")).includes("=")) {
                        // check if is a const
                        if (is("const", -6)) {
                            cc = "";
                            del(i, 1);
                        } 
                        // otherwise is a var
                        else {
                            cc = "var";
                        }                        

                        // cast int to int using | 0
                        if (dataType === "int") {
                            insert(idxOfNext(";") + 1, " | 0");
                        }

                        i += dataType.length - 1;
                    } else if (dataType === "float" || dataType === "double") {
                        cc = "";
                        i += dataType.length - 1;
                    }

                    if (isStaticCast) {
                        cc = "";
                        del(i, 11);
                        del(i + dataType.length + 1, 1);
                    }
                }
            }

            // remove standard namespace
            if (is("std::")) {
                cc = "";
                i += 4;
            }
            // cout
            if (is("cout")) {
                cc = "std_cout('' +";
                insert(idxOfNext(";") + 1, ")")
                i = idxOfNext('<<') + 1;
            }
            // cerr
            if (is("cerr")) {
                cc = "std_cerr('' +";
                insert(idxOfNext(";") + 1, ")")
                i = idxOfNext('<<') + 1;
            }

            // this is now concatenation
            if (is("<<")) {
                cc = "+";
                i++;
            }
        }

        JSCode += cc;

        // go to next character
        i++;
    }

    JSCode = [
        "var std_cout = console.log;",
        "var std_cerr = console.error;",
        "var int = n => n | 0;"
    ].join("\n") + "\n\n" + JSCode;

    return JSCode;
}