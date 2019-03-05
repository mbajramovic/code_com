const AutotestGenerator = (() => {

//Variables required for operations
//config is .autotest content
var config;
var currentTest;
var get_url;
var post_url;
var atid_url;
var _testSpecifications = [];

const getNextTestID = () => {
    var _nextID = _testSpecifications.length ? Number(_testSpecifications[0].id) : 0;
    for(let i=0; i<_testSpecifications.length; i++) {
        if(_testSpecifications[i] && _testSpecifications[i].id) {
            if(Number(_testSpecifications[i].id) >= _nextID )
                _nextID = Number(_testSpecifications[i].id);
        }
    }
    return (_nextID+1).toString();
}

const mapValues = (data) =>{
    console.log('kk');console.log(data);
    config = data;
    currentTest = config.test_specifications.length > 0 ? config.test_specifications[0] : null;
    importConfigValues();
}

const setGeneratorSetup = () => {
    get_url = window.localStorage.getItem("Zamger_URL_Autotest");
    post_url = get_url;
    window.localStorage.removeItem("Zamger_URL_Autotest");
    
    atGeneratorService.getConfigFile(get_url, mapValues);     
}

//Function which patches all values on to the forms, creates atList and loads first test if it exists
const importConfigValues = () => {
    patchConfigValues(config);
    for(let i=0;i < config.test_specifications.length; i++) {
        addTest(config.test_specifications[i], i+1);
    }
    if(config.test_specifications.length > 0) {
        patchTestValues(config.test_specifications[0], 0);
    }
}

//Function which exports JSON object via DummyService
const exportConfigValues = () => {
	
    var newConfig = getConfigValues();
    let newState = getTestValues();
    for(let i=0; i<_testSpecifications.length; i++) {
        if( _testSpecifications[i] == currentTest ) {
            _testSpecifications[i] = newState;
            break;
        }
    }
    newConfig.test_specifications = _testSpecifications;
    atGeneratorService.saveConfigFile(newConfig, post_url);
}

//Getting general config parameters from form - atConfig
const getConfigValues = () => {
    return {
        id: Number(document.getElementById('id').value) ? Number(document.getElementById('id').value) : 0,
        name: document.getElementById('name').value,
        language: document.getElementById('language').value,
        required_compiler: document.getElementById('required_compiler').value,
        preferred_compiler: document.getElementById('preferred_compiler').value,
        compiler_features: Helpers.splitStringArray('compiler_features'),
        compiler_options: document.getElementById('compiler_options').value,
        compiler_options_debug: document.getElementById('compiler_options_debug').value,
        compile: document.getElementById('compile').checked.toString(),
        run: document.getElementById('run').checked.toString(),
        test: document.getElementById('test').checked.toString(),
        debug: document.getElementById('debug').checked.toString(),
        profile: document.getElementById('profile').checked.toString(),
        test_specifications: []
    };
}

//Patching general config parameters on from
const patchConfigValues = (data) => {
    document.getElementById('id').value = data.id; 
    document.getElementById('name').value = data.name;
    document.getElementById('language').value = window.localStorage.getItem('jezik');//data.language;
    document.getElementById('required_compiler').value = data.required_compiler;
    document.getElementById('preferred_compiler').value = data.preferred_compiler;
    document.getElementById('compiler_features').value = Helpers.concatStringArray(data.compiler_features);
    document.getElementById('compiler_options').value = data.compiler_options;
    document.getElementById('compiler_options_debug').value = data.compiler_options_debug;
    document.getElementById('compile').checked = Helpers.getBooleanValue(data.compile);
    document.getElementById('run').checked = Helpers.getBooleanValue(data.run);
    document.getElementById('test').checked = Helpers.getBooleanValue(data.test);
    document.getElementById('debug').checked = Helpers.getBooleanValue(data.debug);
    document.getElementById('profile').checked = Helpers.getBooleanValue(data.profile);
}

//Getting expected and alternative output values
const getExpectedOutputValues = () => {
    var outputContainer = document.getElementById('expected_output_variants');
    let values = [];
    for(let i=3; i < outputContainer.children.length; i+=2) {
        let child = outputContainer.children[i];
        values.push(child.children[0].value);
    }
    return values;
}

//Getting values from test details (atPreview)
const getTestValues = () => {
    return {
        id: Number(document.getElementById('at_id').value),
        require_symbols: Helpers.splitStringArray('require_symbols'),
        replace_symbols: Helpers.splitStringArray('replace_symbols'),
        code: document.getElementById('code').value,
        global_above_main: document.getElementById('global_above_main').value,
        global_top: document.getElementById('global_top').value,
        running_params: {
            timeout: document.getElementById('timeout').value,
            vmem: document.getElementById('vmem').value,
            stdin: document.getElementById('stdin').value
        },
        expected: getExpectedOutputValues(),
        expected_exception: document.getElementById('expected_exception').checked.toString(),
        expected_crash: document.getElementById('expected_crash').checked.toString(),
        ignore_whitespace: document.getElementById('ignore_whitespace').checked.toString(),
        regex: document.getElementById('regex').checked.toString(),
        substring: document.getElementById('substring').checked.toString()      
    };
}

//Remove all alternative output values added dynamically
const removeAdditionalExpectedValues = () => {
    var outputContainer = document.getElementById('expected_output_variants');
    while(outputContainer.children.length != 4)
        outputContainer.removeChild(outputContainer.children[outputContainer.children.length-1]);
}

//Patch expected output correctly, creating alternative variants if needed
const patchExpectedOutputValues = (data) => {
    if(data.length == 0) return;
    document.getElementById('variant_1').value = data[0];
    if(data.length > 1) {
        for(let i=1; i<data.length;i++) {
            addOutputVariant();
            var objectID = 'variant_' + (i+1).toString();
            document.getElementById(objectID).value = data[i];
        }
    }
}

//Patching values for specific test entry on form (atPreview)
const patchTestValues = (data, index) => {
    removeAdditionalExpectedValues();
    document.getElementById('at_id').value = data.id == "" && _testSpecifications.length ? getNextTestID() : data.id; 
    document.getElementById('at_name').value = index == -1 ? "": "Autotest " + (index+1).toString();
    document.getElementById('require_symbols').value = Helpers.concatStringArray(data.require_symbols);
    document.getElementById('replace_symbols').value = Helpers.concatStringArray(data.replace_symbols);
    document.getElementById('code').value = data.code; //.replace(/\\n/g,'\n');
    document.getElementById('global_above_main').value = data.global_above_main;
    document.getElementById('global_top').value = data.global_top;
    document.getElementById('timeout').value = data.running_params.timeout;
    document.getElementById('vmem').value = data.running_params.vmem;
    document.getElementById('stdin').value = data.running_params.stdin;
    patchExpectedOutputValues(data.expected);
    document.getElementById('expected_exception').checked = Helpers.getBooleanValue(data.expected_exception);
    document.getElementById('expected_crash').checked = Helpers.getBooleanValue(data.expected_crash);
    document.getElementById('ignore_whitespace').checked = Helpers.getBooleanValue(data.ignore_whitespace);
    document.getElementById('regex').checked = Helpers.getBooleanValue(data.regex);
    document.getElementById('substring').checked = Helpers.getBooleanValue(data.substring);
}

//selfnote: Could go to helpers, as it just helps out finding adequate index for test in _testSpecification based on atList
const getTestIndex = (objectID) => {
    var listContainer = document.getElementById('atList');
    for(let i=2; i < listContainer.children.length; i++) {
        if( listContainer.children[i].id == objectID)
            return i-2;
    }
}

//Switching out which test is loaded into atPreview
const editTest = (objectID) => {
    //Saving changes to current test and saving into _testSpecification array
    let newState = getTestValues();
    for(let i=0; i< _testSpecifications.length; i++) {
        if( _testSpecifications[i] == currentTest ) {
            _testSpecifications[i] = newState;
            break;
        }
    }
    var index = getTestIndex(objectID);
    //Correcting list label if test was previously unedited
    var labelNode = document.getElementById(objectID).children[0];
    if(labelNode.innerHTML.includes('(Unedited'))
        labelNode.innerHTML = "Autotest " + (index+1).toString();
    //Patching target test values    
    currentTest = _testSpecifications[index];
    patchTestValues(currentTest, index);
}

//Updating numbers on atList elements, required after deleting test
const updateListLabels = (index) => {
    var listContainer = document.getElementById('atList');
    for(let i=index+2; i<listContainer.children.length;i++) {
        var child = listContainer.children[i].children[0];
        if(child.innerHTML.includes('(Unedited)')) {
            child.innerHTML = "Autotest " + (i-1).toString() + " (Unedited)";
        } else {
            child.innerHTML = "Autotest " + (i-1).toString();
        }
    }
}

//Deleting test from _testSpecification and atList
const removeTest = (objectID) => {
    var listContainer = document.getElementById('atList');
    var index = getTestIndex(objectID);
    //If currently open test is being deleted, load next test in row or first
    if(_testSpecifications[index]==currentTest) {
        if(index == _testSpecifications.length-1) {
            currentTest = _testSpecifications[0];
            patchTestValues(currentTest, 0);
        } else {
            currentTest = _testSpecifications[index+1];
            patchTestValues(currentTest, index);
        }
    }
    //Removing from _testSpecifications and atList
    _testSpecifications.splice(index,1);
    listContainer.removeChild(document.getElementById(objectID));
    updateListLabels(index);
    // If there are no tests, clear all test fields and add proper text
    if(listContainer.children.length == 2) {
        patchTestValues(Helpers.emptyTest, -1);
        currentTest = Helpers.emptyTest;
        document.getElementById('at_warning').style.display = "block";
    }    
}

//Adding new test to _testSpecification and atList
const addTest = (data, number) => {
    //Hiding no tests warning
    document.getElementById('at_warning').style.display = "none";
    //Adding data to _testSpecification
    if(!!data) {
        _testSpecifications.push(data);
    } else {
        //Pushing new, empty test
        _testSpecifications.push(Helpers.emptyTest);
    }
    var listContainer = document.getElementById('atList');
    //Creating DOM Elements
    var newRow = document.createElement("div");
    var label = document.createElement("label");
    var icons = document.createElement("div");
    var edit_icon = document.createElement("i");
    var delete_icon = document.createElement("i");    
    //Setting text values
    label.innerHTML = "Autotest " + number;
    edit_icon.innerHTML = "edit";
    delete_icon.innerHTML = "delete_forever";
    //Adding CSS class properties
    newRow.classList.add("row");
    newRow.classList.add("justify-content-between");
    label.classList.add("col-form-label-sm");
    edit_icon.classList.add("material-icons", "float-right");    
    delete_icon.classList.add("material-icons", "float-right");
    newRow.id = "at_" + Helpers.generateIndexSuffix(); 
    //Appending label and icons to row, then row to list    
    newRow.appendChild(label);
    icons.appendChild(delete_icon);
    icons.appendChild(edit_icon);
    newRow.appendChild(icons);    
    listContainer.appendChild(newRow);
    //Binding onclick events
    edit_icon.onclick = function () {
        editTest(edit_icon.parentNode.parentNode.id);
    };
    delete_icon.onclick = function () {
        removeTest(delete_icon.parentNode.parentNode.id);
    };
}

//Removing alternative output 
const removeOutputVariant = (objectID) => {
    var outputContainer = document.getElementById('expected_output_variants');
    var tempArray = objectID.split("_");
    var variant_id = tempArray[tempArray.length-1];
    outputContainer.removeChild(document.getElementById(objectID));
    var textRowID = "text_div_v_" + variant_id;
    outputContainer.removeChild(document.getElementById(textRowID));
}

//Dynamically adding alternative output 
const addOutputVariant = () => {
    var outputContainer = document.getElementById('expected_output_variants');
    var variant_number = (outputContainer.children.length/2);
    //Creating DOM Elements
    var labelRow = document.createElement("div");
    var textRow = document.createElement("div");
    var label = document.createElement("label");
    var delete_icon = document.createElement("i");
    var textarea = document.createElement("textarea");
    //Setting text values
    label.innerHTML = "Alternative output";
    delete_icon.innerHTML = "delete_forever";
    //Adding properties
    labelRow.classList.add("col-sm-2");
    labelRow.id = "label_div_v_" + variant_number;    
    label.htmlFor = "variant_" + variant_number;
    label.classList.add("col-form-label-sm");    
    delete_icon.classList.add("material-icons", "float-right");    
    textRow.classList.add("col-sm-10");
    textRow.id = "text_div_v_" + variant_number;    
    textarea.placeholder = "Expected Output (Alternative)";
    textarea.rows = 4;
    textarea.classList.add("form-control", "form-control-sm");
    textarea.id = "variant_" + variant_number;
    //Appending children
    labelRow.appendChild(label);
    labelRow.appendChild(delete_icon);
    textRow.appendChild(textarea);
    outputContainer.appendChild(labelRow);
    outputContainer.appendChild(textRow);
    //Binding onclick events
    delete_icon.onclick = function () {
        removeOutputVariant(delete_icon.parentNode.id);
    } 
}

return {
    importConfigValues: importConfigValues,
    exportConfigValues: exportConfigValues,
    getConfigValues: getConfigValues,
    patchConfigValues: patchConfigValues,
    getExpectedOutputValues: getExpectedOutputValues,
    getTestValues: getTestValues,
    removeAdditionalExpectedValues: removeAdditionalExpectedValues,
    patchExpectedOutputValues: patchExpectedOutputValues,
    patchTestValues: patchTestValues,
    getTestIndex: getTestIndex,
    editTest: editTest,
    updateListLabels: updateListLabels,
    removeTest: removeTest,
    addTest: addTest,
    removeOutputVariant: removeOutputVariant,
    addOutputVariant: addOutputVariant,
    setGeneratorSetup: setGeneratorSetup
}

})();

