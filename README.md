# CPPTOJS
A JavaScript library that converts C++ code into JavaScript code. Well, at least that's what it was supposed to be, but then I got to the point of trying to implement operator overloading and function overloading in JavaScript and gave up. So yeah, this library does work, but only for super simple C++ programs that don't use any functionality that JavaScript doesn't support such as function overloading, operator overloading, references, and pointers.

Maybe someday I'll come back to this and try and implement an equivelant to implement all that stuff in JavaScript even though JS doesn't have native support for it, but for now I'm gonna focus more on my JVM.

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
