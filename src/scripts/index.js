import {clearHTML, appendHTML, selectPerspective, generateGCode} from "./auxilaryFunctions";
import {
    otworKostka,
    otworWalec,
    kartaObrobkiKostka,
    kartaObrobkiWalec,
    kostka,
    walec,
    listaPrzygotowek
} from "./objects";
import {debug} from "webpack";

// noinspection SpellCheckingInspection
const elements = require('./elements.js');
const processor = require('./cad').gProcessor;
const originFunction = require('../models/origin-function');
let przygotowka = null;
let wybranyElement = null;

let model = null;
let additionalFunctions = [``, ``, ``]; // [origin, center, functions]
let openjscadCodeElements = [`
function main() {
    let model = union(
        `, additionalFunctions[0],`,
        difference(
            `, model, `
    ))`, additionalFunctions[1],`;
    return model;
}`, additionalFunctions[2]];

function bringUp(arrayOfObjectsWithNazwaProperty, goToStep) {
    clearHTML(elements.mainChoicesList);
    for (let item of arrayOfObjectsWithNazwaProperty) {
        appendHTML(elements.mainChoicesList, `<li>${item.nazwa}</li>`);
    }

    for (let el of elements.mainChoices) {
        el.addEventListener('click', goToStep);
    }
}
function identifyAndSetUp(clicked, list, goToStep) {
    let variable;
    for (let item of list) {
        if (clicked.innerHTML === item.nazwa) {
            variable = item;
            /*
            setUp(i.nazwyWymiarów, goToStep)
            */
            // setUp function:
            clearHTML(elements.dataInput);
            for (let j of item.nazwyWymiarow) {
                appendHTML(elements.dataInput, `<li>${j}<br>
                <input type="text"></li>`);
            }
            appendHTML(elements.dataInput, `<button id="getInput">Zapisz</button>`);
            elements.getInput = document.getElementById('getInput');
            elements.getInput.addEventListener('click', goToStep);
        }
    }
    return variable;
}
function readInput(ObjectWithListaWymiarowArrayProperty) {
    for (let i = 0; i < elements.input.length; i++) {
        ObjectWithListaWymiarowArrayProperty.listaWymiarow[i] = elements.input[i].value;
    }
    clearHTML(elements.dataInput);
}
// Modeling functions:
function gatherCode() {
    openjscadCodeElements[1] = additionalFunctions[0];
    openjscadCodeElements[3] = model;
    openjscadCodeElements[5] = additionalFunctions[1];
    openjscadCodeElements[7] = additionalFunctions[2];
    let codeDraft;
    return `foo`;
    //return openjscadCodeElements.forEach(element => codeDraft.concat[element]); // does this work?
}
function createModel() {
    let insertFigure;
    let insertAdditional;
    switch (przygotowka) {
        case kostka:
            insertFigure = `cube({size: [${przygotowka.listaWymiarow[0]}, ${przygotowka.listaWymiarow[1]}, ${przygotowka.listaWymiarow[2]}]})`;
            insertAdditional = `.translate([0, 0, ${-przygotowka.listaWymiarow[2]}])`;
            additionalFunctions[0] = `drawOrigin().translate([0, 0, 1])`;
            additionalFunctions[1] = `.translate([${-przygotowka.listaWymiarow[0]/2}, ${-przygotowka.listaWymiarow[1]/2}, 0])`;
            break;
        case walec:
            insertFigure = `cylinder({r: ${przygotowka.listaWymiarow[0]/2}, h: ${przygotowka.listaWymiarow[1]}})`;
            insertAdditional = `.rotateX(-90)`;
            additionalFunctions[0] = `drawOrigin().rotateX(-90).translate([0, -1, 0])`; // axes (code)=(drawing): X=X, Y=-Z, Z=Y
            additionalFunctions[1] = `.translate([0, ${przygotowka.listaWymiarow[1]/2}, 0])`;
            break;
        default:
            alert(`Nie wybrano przygotówki. Zmienna "przygotowka" to ${przygotowka}`);
            break;
    }
    model = `${insertFigure}${insertAdditional}`;
    additionalFunctions[2] = originFunction;
    drawModel(gatherCode());
}
function modifyModel(przygotowka) {
    switch (przygotowka) {
        case kostka:
            debugger;
            model += dodacObrobkeKostka();
            debugger;
            break;
        case walec:
            model += dodacObrobkeWalec();
            break;
        default:
            alert(`Przygotówki nie znaleziono. Zmienna "przygotowka" to ${przygotowka}`);
            break;
    }
    drawModel(gatherCode());
}
function dodacObrobkeKostka() {
    let insertElement = `,
    `;
    switch (przygotowka.kartaObrobki.listaObrobek[length].nazwa) { // does not switch, empty listaObrobek!
        case `otwór`:
            //insertElement = `cylinder({r: ${przygotowka.kartaObrobki.listaObrobek[length].}, h: }).translate([, , ])`;
            console.log(`Otwór dodany.`);
            break;
        case ``:
            console.log(`Puste.`);
            break;
        default:
            alert(`Został dodany nierozpoznany element.`);
            break;
    }
    return insertElement;
}
function dodacObrobkeWalec() {
    switch (przygotowka.kartaObrobki.listaObrobek[length].nazwa) {
        case `otwór`:
            console.log(`Otwór dodany.`);
            break;
        case ``:
            console.log(`Puste.`);
            break;
        default:
            alert(`Został dodany nierozpoznany element.`);
            break;
    }
}
function drawModel(openjscadCode) {
    processor.setJsCad(openjscadCode);
}

// Main line:
function etapPrzygotowki() {

    krok1();
    function krok1() {
        bringUp(listaPrzygotowek, krok2);
    }
    function krok2() {
        przygotowka = identifyAndSetUp(this, listaPrzygotowek, krok3);
    }
    function krok3() {
        readInput(przygotowka);
        createModel();

        etapObrobki();
    }
}
function etapObrobki() {

    krok1();
    function krok1() {
        bringUp(przygotowka.kartaObrobki.listaElementow, krok2);
    }
    function krok2() {
        wybranyElement = identifyAndSetUp(this, przygotowka.kartaObrobki.listaElementow, krok3);
    }
    function krok3() {
        readInput(wybranyElement);
        przygotowka.kartaObrobki.listaObrobek.push(wybranyElement);             // is a method in przygotowka.kartaObrobki !
        modifyModel(przygotowka);
    }
}

// Activation:
function bindListeners() {
    // Class "header":
    elements.btnStart.addEventListener('click', etapPrzygotowki);

    // Class "viewsList":
    for (let i = 0; i < elements.views.length; i++) {
        elements.views[i].addEventListener('click', selectPerspective);
    }

    // Class "drawing":
    // Class "mainChoicesList":
    // Class "dataInput":
    // Class "footer":
    elements.btnGenerateGCode.addEventListener('click', function () {
        generateGCode(przygotowka);
    });
    elements.btnFinish.addEventListener('click', () => {
        console.log(`Finished.`);
    });
}
// document.addEventListener("DOMContentLoaded", function() {
    bindListeners();
// });
