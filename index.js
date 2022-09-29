// compiles C++ code to ASM.JS using JavaScript
var CPPTOJS = function (entryPoint) {
    var code = CPPTOJS.fileTree.CPP[entryPoint];

    if (code === undefined) {
        code = "/* FILE NOT FOUND */";
    }

    var JSCode = ""; // result of transpilation

    var i = 0, cc = ""; // index of cursor in code

    // store some other stuff
    var inString = false, inSingleLineComment = false;

    // store code line number
    var lineNum = 1;

    var specialKeywords = "alignas decltype namespace struct alignof default new switch and delete noexcept template and_eq do not this asm double not_eq thread_local auto dynamic_cast nullptr throw bitand else operator true bitor enum or try bool explicit or_eq typedef break export private typeid case extern protected typename catch false public union char float register unsigned char16_t for reinterpret_cast using char32_t friend return virtual class goto short void compl if signed volatile const inline sizeof wchar_t constexpr int static while const_cast long static_assert xor continue mutable static_cast xor_eq".split(" ");

    var dataTypes = "int long char float double bool short string auto".split(" ");

    function fileNameToJS (fileName) {
        return fileName.split(".")[0] + ".mjs";
    }

    function isValidVarName (txt) {
        var numbers = "0123456789";
        var invalids = " ~`!@#%^&*()-=+[]{}\\;:'\",.<>/?";

        if (numbers.includes(txt.charAt(0)) || specialKeywords.includes(txt) || dataTypes.includes(txt)) {
            return false;
        }

        for (var i = 0; i < invalids.length; i++) {
            if (txt.includes(invalids.charAt(i))) {
                return false;
            }
        }

        return true;
    }

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

    function idxOfNext (txt, skip) {
        var idx = code.slice(i).indexOf(txt);
        skip = skip || 0;
        while (skip > 0) {
            idx = code.slice(idx + 1).indexOf(txt);
            skip--;
        }
        return idx === -1 ? code.length : i + idx;
    }

    code = code.replaceAll("\t", "    ");

    let lines = code.split("\n");
    let minIndent = Infinity;
    for (var j = 0; j < lines.length; j++) {
        let k = lines[j].length - lines[j].trimStart().length;
        if (k < minIndent && lines[j].trim().length > 0) {
            minIndent = k;
        }
    }

    for (var j = 0; j < lines.length; j++) {
        lines[j] = lines[j].slice(minIndent);
    }

    code = lines.join("\n");

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
            if (is("#include")) {
                i += 9;
                
                let fName = code.slice(i, idxOfNext("\n")).trim();
                fName = fName.slice(1, fName.length - 1);

                if (["iostream"].includes(fName)) {
                    cc = "";
                } else {
                    cc = "import \"" + fileNameToJS(fName) + "\";\n";
                    CPPTOJS(fName);
                }

                i = idxOfNext("\n");
            }

            if (is("true")) {
                cc = "TRUE";
                i += 3;
            }
            if (is("false")) {
                cc = "FALSE";
                i += 4;
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
                        i += dataType.length - 1;

                        var functionName = code.slice(i + 1, idxOfNext("(")).trim();
                        if (functionName === "main") {
                            cc = "async function";
                        } else {
                            cc = "function";
                        }
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
                        var castContent = code.slice(idxOfNext("(") + 1, idxOfNext(")"));
                        if (isValidVarName(castContent)) {
                            del(i, 1);
                            del(i + castContent.length + 5, 1);
                        }
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
            if (is("::")) {
                cc = ".";
                i += 1;
            }
            // cout
            if (is("cout")) {
                cc = "cout('' +";
                insert(idxOfNext(";") + 1, ")")
                i = idxOfNext('<<') + 1;
            }
            // cerr
            if (is("cerr")) {
                cc = "cerr('' +";
                insert(idxOfNext(";") + 1, ")")
                i = idxOfNext('<<') + 1;
            }
            // cin
            if (is("cin")) {
                cc = "cin('' +";
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

    JSCode = 'import "std.js";\n' + JSCode + "\n\nmain();";

    try {
        Function(JSCode);
    } catch (err) {
        if (!err.toString().includes(" import ")) {
            console.log(err);
            return "// FAILED TO TRANSPILE TO JS //\n" + JSCode;
        }
    }

    CPPTOJS.fileTree.JS[fileNameToJS(entryPoint)] = JSCode;
}

CPPTOJS.buildFileTree = function (el) {
    CPPTOJS.fileTree = {};

    var files;
    if (!el) {
        el = document.getElementById("CPPTOJS");
    }
    files = el.getElementsByTagName("script");

    for (var i = 0; i < files.length; i++) {
        let path = files[i].id.split("/");

        let currCPPDir = CPPTOJS.fileTree;
        for (var j = 0; j < path.length; j++) {
            let dirName = path[j];
            if (dirName.includes(".")) {
                currCPPDir[dirName] = files[i].innerHTML;
            } else if (!currCPPDir[dirName]) {
                currCPPDir[dirName] = {};
            }
            currCPPDir = currCPPDir[dirName];
        }
    }

    function copyForJS (obj) {
        let newObj = {};

        for (let property in obj) {
            let value = obj[property];
            switch (typeof value) {
                case "string":
                    newObj[property.split(".")[0] + ".mjs"] = "";
                    break;
                case "object":
                    newObj[property] = copyObject(value);
                    break;
            }
        }

        return newObj;
    }

    CPPTOJS.fileTree.JS = copyForJS(CPPTOJS.fileTree.CPP);

    CPPTOJS.fileTree.JS["std.mjs"] = `var std = {
    cout: console.log, 
    cerr: console.error, 
    cin: window.prompt,
    string: String
};
var int = n => n | 0;
var endl = "\\n";
var TRUE = 1, FALSE = 0;`;
    
};

CPPTOJS.transpile = function (entryPoint) {
    CPPTOJS(entryPoint);
    return CPPTOJS.fileTree.JS;
};
