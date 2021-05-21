module.exports = {
    page: document.getElementById(`page`),
    mainPage: document.getElementById(`main-page`),
    // Class "header":
    btnStart: document.getElementById(`btnStart`),
        //openedFilesList: document.getElementById(`openedFiles`),
        //openedFiles: document.getElementById(`openedFiles`).getElementsByTagName(`li`),
    btnGenerateGCode: document.getElementById(`btnGenerateGCode`),
    btnExport: document.getElementById('btnExport'),
    inputFile: document.getElementById('input-file'),
    btnHelp: document.getElementById(`btnHelp`),
    // Class "leftList":
        //views: document.getElementById(`leftList`).getElementsByTagName(`li`),
        //activeElements: document.getElementsByClassName(`active`),
    history: document.getElementById(`history`),
    points: document.getElementById(`history`).getElementsByTagName(`li`),
    // Class "drawing":
    drawingOuter: document.getElementById(`drawing`),
    drawing: document.getElementById(`drawing-place`),
    perspective: document.getElementById(`perspective`),
    // Class "rightList":
    upperField: document.getElementById(`upperField`),
    choicesList: document.getElementById(`mainChoicesList`),
    choices: document.getElementById(`mainChoicesList`).getElementsByTagName(`li`),
    // Class "dataInput":
    lowerField: document.getElementById(`lowerField`),
    inputsList: document.getElementById(`dataInput`),
    inputs: document.getElementById(`dataInput`).getElementsByTagName(`input`),
    getInput: [],
    wstecz: [],
    // Class "footer":
    console_log: document.getElementById(`console-log`),
    console_log_2: document.getElementById(`console-log-2`)
};
