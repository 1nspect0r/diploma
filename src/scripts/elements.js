module.exports = {
    // might be rewritten with querySelector, but it requires rewriting after changing the content (mainChoices isn't updated automatically when mainChoicesList is)

    // Class "header":
    btnStart: document.getElementById(`btnStart`),
    // Class "viewsList":
    views: document.getElementById(`viewsList`).getElementsByTagName(`li`),
    activeElements: document.getElementsByClassName(`active`),
    // Class "drawing":
    drawing: document.getElementById(`drawing`),
    perspective: document.getElementById(`perspective`),
    // Class "mainChoicesList":
    mainChoicesList: document.getElementById(`mainChoicesList`),
    mainChoices: document.getElementById(`mainChoicesList`).getElementsByTagName(`li`),
    // Class "dataInput":
    dataInput: document.getElementById(`dataInput`),
    input: document.getElementById(`dataInput`).getElementsByTagName(`input`),
    getInput: [],
    // Class "footer":
    btnGenerateGCode: document.getElementById(`btnGenerateGCode`),
    btnFinish: document.getElementById('btnFinish')
};
