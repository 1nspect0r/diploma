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

// noinspection SpellCheckingInspection
let elements = require('./elements.js');
let processor = require('./cad').gProcessor;
let model = ``;
let przygotowka = null;
let wybranyElement = null;

/*
function drawOrigin() {
    const origin = require('../models/origin');
    processor.setJsCad(origin);
}*/
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
function createModel() {
    let figure;
    let additionalInsert;
    switch (przygotowka) {
        case kostka:
            figure = `cube({size: [${przygotowka.listaWymiarow[0]}, ${przygotowka.listaWymiarow[1]}, ${przygotowka.listaWymiarow[2]}]})`;
            additionalInsert = `.translate([0, 0, -${przygotowka.listaWymiarow[2]}])`;
            break;
        case walec:
            figure = `cylinder({r: ${przygotowka.listaWymiarow[0]/2}, h: ${przygotowka.listaWymiarow[1]}})`;
            additionalInsert = `.rotateX(-90)`;
            break;
        default:
            alert(`Nie wybrano przygotówki. Zmienna "przygotowka" to ${przygotowka}`);
            break;
    }
    model = `
    function main() {
        let model = difference(
            ${figure}${additionalInsert}
        ); return model; }`;
    debugger;
    drawModel(model);
}
function modifyModel(przygotowka) {
    debugger;
    model -= `
    ); return model; }`;                      // not a solution. Find this string, then slice
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
    model += `
    ); return model; }`;
    drawModel(model);
    /*
    if (elements.drawing.innerHTML !== '') {
        elements.drawing.innerHTML += ` + ${przygotowka.kartaObrobki.listaObrobek[length].nazwa} ${przygotowka.kartaObrobki.listaObrobek[length].listaWymiarow}`;
    } else {
        elements.drawing.innerHTML = `${przygotowka.nazwa} ${przygotowka.listaWymiarow}`;
    }
    */
}
function dodacObrobkeKostka() {
    let elementInsert = `,
    `;
    elementInsert += `cylinder({r: 2, h: 100}).translate([10,10,-50])`;
    switch (przygotowka.kartaObrobki.listaObrobek[length].nazwa) {
        case `otwór`:
            //elementInsert = `cylinder({r: ${przygotowka.kartaObrobki.listaObrobek[length].}, h: }).translate([, , ])`;
            console.log(`Otwór dodany.`);
            break;
        case ``:
            console.log(`Puste.`);
            break;
        default:
            alert(`Został dodany nierozpoznany element.`);
            break;
    }
    return elementInsert;
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
function drawModel(model) {
    processor.setJsCad(model);
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
    btnStart.addEventListener('click', etapPrzygotowki);

    // Class "viewsList":
    for (let i = 0; i < elements.views.length; i++) {
        elements.views[i].addEventListener('click', selectPerspective);
    }

    // Class "drawing":
    // Class "mainChoicesList":
    // Class "dataInput":
    // Class "footer":
    btnGenerateGCode.addEventListener('click', function () {
        generateGCode(przygotowka);
    });
    btnFinish.addEventListener('click', () => {
        console.log(`Finished.`);
    });
}
// document.addEventListener("DOMContentLoaded", function() {
    bindListeners();
// });
