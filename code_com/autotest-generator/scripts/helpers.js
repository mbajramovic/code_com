Helpers = (() => {
    //Empty test JSON for adding new test into _testSpecifications
    const emptyTest = {
        "id": "",
        "require_symbols": [],
        "replace_symbols": [],
        "code": "",
        "global_above_main": "",
        "global_top": "",
        "running_params": {
            "timeout": "",
            "vmem": "",
            "stdin": ""
        },
        "expected": [""],
        "expected_exception": "false",
        "expected_crash": "false",
        "ignore_whitespace": "false",
        "regex": "false",
        "substring": "false"
    };
   
    const getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max-min)) + min;
    }

    const generateIndexSuffix = () =>{
        return new Date().valueOf() + "-" + getRandomInt(1000,11000);
    }

    const splitStringArray = (objectID) => {
        var rawData = document.getElementById(objectID).value;
        if(rawData == "") return [];
        var splitData = rawData.split(",");
        for(let i=0; i< splitData.length; i++) {
            splitData[i] = splitData[i].substr(1, splitData[i].length-2);
        }
        return splitData;
    }

    const concatStringArray = (data) => {
        let value = "";
        for(let i=0; i< data.length; i++) {
            value += '\"' + data[i] + '\",';
        }
        return value.substr(0, value.length-1);
    }

    const escapeNewLine = (value) => {
        //Replaces all new lines in textarea string to '\n '
        return value ? value.replace(/(?:\r|\n|\r\n)/g, '\\n ') : "";
    }

    const getBooleanValue = (data) => {
        return data == "true" ? true : false;
    }

    const openGenerator = (path, url, zamger) => {
        //window.localStorage.setItem("Zamger_URL_Autotest", url);
        if(zamger == true) {
            //w.open(path);
        }
    }

    return {
        emptyTest: emptyTest,
        splitStringArray: splitStringArray,
        concatStringArray: concatStringArray,
        escapeNewLine: escapeNewLine,
        getBooleanValue: getBooleanValue,
        getRandomInt: getRandomInt,
        generateIndexSuffix: generateIndexSuffix,
        openGenerator: openGenerator
    }
})();


