# CPPTOJS
A JavaScript library that converts C++ code into JavaScript code. Well, at least that's what it was supposed to be, but then I got to the point of trying to implement operator overloading and function overloading in JavaScript and gave up. So yeah, this library does work, but only for super simple C++ programs that don't use any functionality that JavaScript doesn't support such as function overloading, operator overloading, references, and pointers.

I'm probably never going to work on this again because I now realize that converting between a really low level language and a really high level language just isn't practical. If you want to run C++ in a web browser then compiling to WebAssembly instead of transpiling to JavaScript is definitely the way to go.

## How To Use
1) Import CPPTOJS (the index.js file on this repo)

2) Create a div with the id `CPPTOJS` and put script tags in it. Each script tag represents a C++ file. Set the id of each script to a file path. Make sure that the file path begins with `CPP/` . Also make sure to set the `type` on the script tag so that the browser will not try running it as code.
```
<div id="CPPTOJS">
    <script id="CPP/vec3.h" type="text/cpp">
        // C++ code here
    </script>

    <script id="CPP/main.cpp" type="text/cpp">
        // C++ code here
    </script>
</div>
```

3) Call the `CPPTOJS.buildFileTree();` method. This will build a file tree using the div of files from the previous step

4) Run the `CPPTOJS.transpile()` method. Its one parameter is a String containing the name of the file which should be the entry point. This method returns file tree containing module JavaScript files
```
var JSFileTree = CPPTOJS.transpile("main.cpp");
console.log(JSFileTree);
```
