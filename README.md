# CPPTOJS
A JavaScript library that converts C++ code into JavaScript code

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
