import {clearHTML, appendHTML, selectPerspective, generateGCode} from "./auxilaryFunctions";
import {
    kartaObrobkiKostka,
    kartaObrobkiWalec,
    kostka,
    listaPrzygotowek,
    otworKostka,
    perspectives,
    walec,
    wybranyElement
} from "./objects";

// noinspection SpellCheckingInspection
let przygotowka = null;
let elements = require('./elements.js');

function bringUp(arrayOfObjectsWithNazwaProperty, goToStep) {
    clearHTML(elements.mainChoicesList);
    for (let i of arrayOfObjectsWithNazwaProperty) {
        appendHTML(elements.mainChoicesList, `<li>${i.nazwa}</li>`);
    }

    debugger;
    for (let el of elements.mainChoices) {
        console.log('zxxxxxx', el);
        el.addEventListener(`click`, goToStep);
    }
}

function identifyAndSetUp(clicked, variable, list, goToStep) {
    for (let item of list) {
        if (clicked.innerHTML === item.nazwa) {
            variable = item;
            /*
            setUp(i.nazwyWymiarów, goToStep)
            */
            // setUp function:
            clearHTML(elements.dataInput);
            console.log(item.nazwyWymiarow);
            console.log(item);
            debugger;
            for (let j of item.nazwyWymiarow) {
                appendHTML(elements.dataInput, `<li>${j}<br>
                <input type="text"></li>`);
            }
            appendHTML(elements.dataInput, `<button id="getInput">Zapisz</button>`);
            elements.getInput = document.getElementById(`getInput`);
            elements.getInput.addEventListener(`click`, goToStep);
        }
    }

    return variable;
}
/*
function setUp(nazwyWymiarowArray, goToStep) {
    clearHTML(dataInput);
    for (let i of nazwyWymiarowArray) {
        appendHTML(dataInput, `<li>${i}<br>
        <input type="text"></li>`);
    }
    appendHTML(dataInput, `<button id="getInput">Zapisz</button>`);
    getInput = document.getElementById(`getInput`);
    getInput.addEventListener(`click`, goToStep);
}
*/
function readInput(ObjectWithListaWymiarowArrayProperty) {
    for (let i = 0; i < elements.input.length; i++) {
        ObjectWithListaWymiarowArrayProperty.listaWymiarow[i] = elements.input[i].value;
    }

    clearHTML(elements.dataInput);
}
function modifyModel() {
    if (elements.drawing.innerHTML !== '') {
        elements.drawing.innerHTML += ` + ${przygotowka.kartaObrobki.listaObrobek[length].nazwa} ${przygotowka.kartaObrobki.listaObrobek[length].listaWymiarow}`;
    } else {
        elements.drawing.innerHTML = `${przygotowka.nazwa} ${przygotowka.listaWymiarow}`;
    }
}
// Main line:
function etapPrzygotowki() {

    krok1();
    function krok1() {
        debugger;
        bringUp(listaPrzygotowek, krok2);
    }
    function krok2() {
        debugger;
        przygotowka = identifyAndSetUp(this, przygotowka, listaPrzygotowek, krok3);
    }
    function krok3() {
        readInput(przygotowka);
        modifyModel();

        etapObrobki();
    }
}
function etapObrobki() {

    krok1();
    function krok1() {
        debugger;
        bringUp(przygotowka.kartaObrobki.listaElementow, krok2);
    }
    function krok2() {
        debugger;
        wybranyElement = identifyAndSetUp(this, wybranyElement, przygotowka.kartaObrobki.listaElementow, krok3);
    }
    function krok3() {
        readInput(wybranyElement);
        przygotowka.kartaObrobki.listaObrobek.push(wybranyElement);
        modifyModel();
    }
}

function bindListeners() {
    // Class "header":
    btnStart.addEventListener(`click`, etapPrzygotowki);

    // Class "viewsList":
    for (let i = 0; i < elements.views.length; i++) {
        elements.views[i].addEventListener(`click`, selectPerspective);
    }

    // Class "drawing":
    // Class "mainChoicesList":
    // Class "dataInput":
    // Class "footer":
    btnGenerateGCode.addEventListener(`click`, function () {
        generateGCode(przygotowka);
    });
}

// document.addEventListener("DOMContentLoaded", function() {
    bindListeners();
// });
