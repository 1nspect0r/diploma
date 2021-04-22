import {clearHTML, modifyHTML, generateGCode, dateTimeFormat1} from "./auxilaryFunctions";
import {
    otworKostka,
    kartaObrobkiKostka,
    kostka
} from "./kostka";
import {
    otworWalec,
    kartaObrobkiWalec,
    walec
} from "./walec";

    // noinspection SpellCheckingInspection
const elements = require('./elements.js');
const processor = require('./cad').gProcessor;
//const originFunction = require('../models/origin-function'); // is an OpenJSCAD code for origin figure (colored arrows)

// Main object storing:
let obrobka = {}; // changes completely each time a new obrobka is added, stores obrobka and is pushed to listaObrobek array in przygotowka object
    // listaObrobek is a parameter in przygotowka object
let przygotowka = {}; // this is the main object, here obrobka is stored; it is used to draw figure, should be exported to save, might also want to import right here too. Nothing changes while program is running, only obrobka objects added in the array.
const dostepnePrzygotowki = [kostka, walec];
    // let listaPrzygotowek = []; for storing different imported przygotowka objects at the same time (function store)

// OpenJSCAD manipulations:
let modelParts = []; // here code for figures is stored (one element for one figure including translations)
let model = ``; // = modelParts.join(', ') here code for figures is united
let codeParts = [`
function main() {
    let model =
        difference(`,
            model,
        `);
    return model;
}`]; // here code for figures is stored with the functional code
let code = ``; // = codeParts.join(``) here all code is united, final entity
const functionsKostka = {
    // these functions are defined for the ALREADY DEFINED przygotowka
    generateCodeFromScratch: function() {
        modelParts = [];
        modelParts.push(`cube({size: [${przygotowka.listaWymiarow[0]}, ${przygotowka.listaWymiarow[1]}, ${przygotowka.listaWymiarow[2]}]}).translate([-${przygotowka.listaWymiarow[0]/2}, -${przygotowka.listaWymiarow[1]/2}, -${przygotowka.listaWymiarow[2]}])`); // origin at top plane, centered
        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            switch (i) {
                case otworKostka:
                    modelParts.push(`kod otworu`);
                    break;
                case `inna obróbka`:
                    modelParts.push(`kod innej obróbki`);
                    break;
                default:
                    console.log(`Obróbki nie istnieje. `);
                    break;
            }
        }
        model = modelParts.join(`, `);
        codeParts[1] = model;
        code = codeParts.join(``);
    },
    /*
    // not going to use this yet:
    clearCode: function() {
        modelParts = [];
    },
    generatePrzygotowkaCode: function() {
        modelParts.push(`cube({size: [${przygotowka.listaWymiarow[0]}, ${przygotowka.listaWymiarow[1]}, ${przygotowka.listaWymiarow[2]}]}).translate([-${przygotowka.listaWymiarow[0]/2}, -${przygotowka.listaWymiarow[1]/2}, -${przygotowka.listaWymiarow[2]}])`); // origin at top plane, centered
        modelParts.push(`//`); // comment at the end of the line, no obróbka will be inserted
    },
    generateObrobkaCode: function() {
        switch (przygotowka.kartaObrobki.listaObrobek[length]) {
            case otworKostka:
                modelParts.push(`kod otworu`);
                break;
            case `inna obróbka`:
                modelParts.push(`kod innej obróbki`);
                break;
            default:
                console.log(`Obróbki nie istnieje. `);
                break;
        }
    }*/
};
const functionsWalec = {

};
let prepareCode = {}; // functions for generating OpenJSCAD code are stored here in the form of methods. Becomes one of two objects with same methods for different code-writing purposes depending on przygotowka
function setFunctions() {
    switch (przygotowka.nazwa) {
        case `kostka`:
            prepareCode = { ...functionsKostka };
            console.log(`Ustawiono funkcje dla kostki. `);
            break;
        case `walec`:
            prepareCode = { ...functionsWalec };
            console.log(`Ustawiono funkcje dla walca. `);
            break;
        default:
            console.log(`Nie ustalono przygotówki. `);
            break;
    }
}
function drawModel() {
    processor.setJsCad(code); // might want to make figure transparent
}

// DOM manipulations:
function loadList(loadOf, nextStep) {
    clearHTML(elements.choicesList);
    for (let i of loadOf) {
        modifyHTML(elements.choicesList, `<li>${i.nazwa}</li>`);
    }
    for (let e of elements.choices) {
        e.addEventListener('click', nextStep);
    }
}
function loadInput(clicked, loadOf, nextStep) {
    let variable;
    for (let i of loadOf) {
        if (i.nazwa === clicked.innerHTML) {
            variable = i;
        }
    }
    clearHTML(elements.inputsList);
    for (let i of variable.nazwyWymiarow) {
        modifyHTML(elements.inputsList, `
            <li>${i}<br>
            <input type="text"></li>
        `);
    }
    modifyHTML(elements.inputsList, `<button id="getInput">Zapisz</button>`);
    elements.upperField.innerHTML = `${variable.opis}`;
    elements.getInput = document.getElementById('getInput');
    elements.getInput.addEventListener('click', nextStep);

    return variable;
}
function processInput(loadTo) {
    for (let i = 0; i < elements.inputs.length; i++) {
        loadTo.listaWymiarow[i] = elements.inputs[i].value;
    }
    if (loadTo === obrobka) {
        przygotowka.kartaObrobki.listaObrobek.push(loadTo);
    }
    clearHTML(elements.inputsList);
    elements.upperField.innerHTML = ``;
    elements.upperField.appendChild(elements.choicesList);
}
function proceed(obj) {
    processInput(obj); // stores input values in object, clears lower section, !rewrites upper section with choices already with listeners! . In case of obrobka, stores obrobka in przygotowka
    prepareCode.generateCodeFromScratch(); // rewrites code each time. Not much work cuz figure is redrawn anyways.
    // or
    /*
    if (obj === przygotowka) {
        prepareCode.generatePrzygotowkaCode();
    } else if (obj === obrobka) {
        prepareCode.generateObrobkaCode();
    }
     */
    drawModel();
}
/*
function store() {
    if (przygotowka === {} || listaPrzygotowek.forEach(p => przygotowka === p)) {
        return;
    }
    listaPrzygotowek.push(przygotowka);
    modifyHTML(elements.openedFilesList, `<li>${listaPrzygotowek.length}</li>`);
    elements.openedFiles.addEventListener('click', () => {
        przygotowka = listaPrzygotowek[this.innerHTML - 1];
        setTimeout(prepareCode.generateCodeFromScratch(), 1000);
    });
}
*/

// Main line:
function etapPrzygotowki() {

    step1();
    function step1() {
        loadList(dostepnePrzygotowki, step2); // clears upper section, adds names, adds listeners
    }
    function step2() {
        przygotowka = loadInput(this, dostepnePrzygotowki, step3); // picks object by clicked item, !rewrites upper section with "opis"! , clears lower section, adds names, input fields and a button, adds listener
    }
    function step3() {
        setFunctions();
        proceed(przygotowka);

        etapObrobki();
    }
}
function etapObrobki() {

    step1();
    function step1() {
        loadList(przygotowka.kartaObrobki.dostepneObrobki, step2);
    }
    function step2() {
        obrobka = loadInput(this, przygotowka.kartaObrobki.dostepneObrobki, step3);
    }
    function step3() {
        proceed(obrobka);
    }
}

// Activation (listeners):
function bindListeners() {
    // Class "header":
    elements.btnStart.addEventListener('click', etapPrzygotowki);
    // Class "viewsList":
    /*
    for (let i = 0; i < elements.views.length; i++) {
        elements.views[i].addEventListener('click', selectPerspective);
    }
    */
    // Class "footer":
    elements.btnGenerateGCode.addEventListener('click', function () {
    });
    elements.btnExport.addEventListener('click', () => {
        exportObject();
    });
    elements.inputFile.addEventListener('change', importObject);
}
    // document.addEventListener("DOMContentLoaded", function() {
bindListeners();
    // });

// Exports and imports:
function exportObject() {
    let a = document.createElement('a');
    a.href = "data:application/octet-stream,"+encodeURIComponent(JSON.stringify(przygotowka));
    a.download = `przygotowka ${dateTimeFormat1()}.txt`;
    a.click();
}
function importObject(event) {
    if (Object.keys(przygotowka).length !== 0) {
        exportObject();
    }
    const input = event.target;
    if ('files' in input && input.files.length > 0) {
        parseFileContent(input.files[0]);
    }
    setTimeout(() => { // waiting for promise, not for parse (yes, they are asynchronous)
        if (Object.keys(przygotowka).length === 0) {
            console.log('Plik pusty. ');
            code = ``;
            drawModel();
            return;
        }
        console.log(`Przygotówkę załadowano. `);
        setFunctions();
        prepareCode.generateCodeFromScratch();
        drawModel();
        if (przygotowka.listaWymiarow) { // если каждый размер больше ноля или есть хоть одна обрубка - пустить в этап обрубки. эту проверку поставить и в последний шаг этапа пшиготувки.
            console.log(`+`); // а не трижды ли она активируется, если там одни ноли?
        }
    }, 100);
}
function parseFileContent(file) {
    readFileContent(file).then(content => {
        przygotowka = JSON.parse(content); // в чём проблема?
        /* there will be an error in condition; also should be a type and version checker of all przygotowka objects
        if (przygotowka.displayInfo() !== dostepnePrzygotowki[0].displayInfo()) {
            przygotowka = {};
            console.log(`Nieprawidłowy format importowanego pliku.
Akceptowalny format: ${dostepnePrzygotowki[0].displayInfo()}
Format wgranego pliku: ${przygotowka.displayInfo()}`);
        }*/
    }).catch(error => console.log(error));
    // сделать потом через промисы и отдать в then после выполнения этой функции в предыдущей
}
function readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result); // what is a) onload, b) event, c) param in resolve() ?
        reader.onerror = error => reject(error);
        reader.readAsText(file); // why is readAsText() here and reader is declared before ?
    })
}

function rollback() {

}
