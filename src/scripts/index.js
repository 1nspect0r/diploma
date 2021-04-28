import {clearHTML, modifyHTML, dateTimeFormat1} from "./auxilaryFunctions";

    // noinspection SpellCheckingInspection
const kostka = require('./kostka').kostka;
const walec = require('./walec').walec;
const elements = require('./elements.js');
const processor = require('./cad').gProcessor;
const originFunction = require('../models/origin-function'); // is an OpenJSCAD code for origin figure (colored arrows)
const m3 = require('../models/m-3');

// Main object storing:
let obrobka = {}; // changes completely each time a new obrobka is added, stores obrobka and is pushed to listaObrobek array in przygotowka object
let przygotowka = {}; // this is the main object, here obrobka is stored; it is used to draw figure, should be exported to save, might also want to import right here too. Nothing changes while program is running, only obrobka objects added in the array.
const dostepnePrzygotowki = [kostka, walec];
    // let listaPrzygotowek = []; for storing different imported przygotowka objects at the same time (function store)
let toRemove = 0; // acquires 1 when current obrobka is going to be removed

// OpenJSCAD manipulations:
let originModel = ``;
let centering = ``;
let partParts = []; // one filled each time a new part is generated, pushed joined to modelParts and cleared. Should be filled with commas manually!
let modelParts = []; // here code for figures is stored (one element for one figure including translations)
let mainModel = ``; // = modelParts.join(', ') here code for figures is united
let codeParts = [`
function main() {
    let model =
        union(`, originModel,
        `difference(`, mainModel,
        `))`, centering ,`;
    return model;
}
`, originFunction]; // here code for figures is stored with the functional code
let code = ``; // = codeParts.join(``) here all code is united, final entity
const functionsKostka = { // przygotowka must be defined
    generateCodeFromScratch: function() {
        modelParts = [];
        let [szerokosc, dlugosc, wysokosc] = przygotowka.listaWymiarow;
        modelParts.push(`cube({size: [${szerokosc}, ${dlugosc}, ${wysokosc}]}).translate([0, 0, ${-wysokosc}])`); // origin at top plane, centered
        //originModel = `drawOrigin([[0, 0, 1], [0, 0, 1], [0, 0, 1]]), `;
        originModel = `drawOrigin([[${szerokosc}, 0, 0], [0, ${dlugosc}, 0], [0, 0, 0]]), `;
        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            switch (i.nazwa) {
                case `czoło`: // PO OBROBCE CZOLA ZMIENIA SIE GLEBOKOSC!
                    {
                        let [h] = i.listaWymiarow;
                        modelParts.push(`cube({size: [${szerokosc}, ${dlugosc}, ${h}]}).translate([0, 0, ${-h}])`);
                    }
                    break;
                case `otwór`:
                    {
                        let [x, y, d, h] = i.listaWymiarow;
                        partParts = [
                            `union(`,
                                `cylinder({r: ${d / 2}, h: ${h}}), `,
                                `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 4 * Math.tan(30 * Math.PI / 180)}}).rotateY(180)`,
                            `).translate([${x}, ${y}, ${-h}])`
                        ];
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                case `kieszeń prostokątna`:
                    {
                        let [x0, y0, x, y, h, r] = i.listaWymiarow;
                        partParts = [                                                                   // Indexes:
                            `union(`,                                                                   // 0
                                `cube({size: [${x - 2 * r}, ${y}, ${h}]}).translate([${r}, 0, 0]), `,   // 1
                                `cube({size: [${x}, ${y - 2 * r}, ${h}]}).translate([0, ${r}, 0]), `,   // 2
                                `cylinder({r: ${r}, h: ${h}}).translate([${x - r}, ${y - r}, 0]), `,    // 3
                                `cylinder({r: ${r}, h: ${h}}).translate([${x - r}, ${r}, 0]), `,        // 4
                                `cylinder({r: ${r}, h: ${h}}).translate([${r}, ${y - r}, 0]), `,        // 5
                                `cylinder({r: ${r}, h: ${h}}).translate([${r}, ${r}, 0])`,              // 6
                            `).translate([${x0}, ${y0}, ${-h}])`                                        // 7
                        ];
                        {
                            if (y - 2 * r < 0 || x - 2 * r < 0) { // y < 2 * 4 || x < 2 * r
                                console.log(`Kieszeń prostokątna o numerze ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}: za duży promień zaokrąglenia. Obróbka nie została wykonana. `);
                                toRemove = 1; // does nothing if importing an object, though cannot export objects that pass in this section
                                break;
                            }
                            if (x - 2 * r === 0) {
                                partParts[1] = ``;
                                partParts[3] = ``; // cylinders are overlapping
                                partParts[4] = ``;
                            }
                            if (y - 2 * r === 0) {
                                partParts[2] = ``;
                                partParts[3] = ``;
                                partParts[5] = ``;
                            }
                        } // conditions
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                case `kieszeń okrągła`:
                    {
                        let [x0, y0, r, h] = i.listaWymiarow;
                        modelParts.push(`cylinder({r: ${r}, h: ${h}}).translate([${x0}, ${y0}, ${-h}])`);
                    }
                    break;
                case `rowek kołowy`: //                                                                                 !!!
                    {
                        let [x0, y0, R, l, h] = i.listaWymiarow;
                        partParts = [                                                               // Indexes:
                            `difference(`,                                                          // 0
                                `cylinder({r: ${parseFloat(R) + parseFloat(l) / 2}, h: ${h}})`,     // 1
                                `, `,                                                               // 2
                                `cylinder({r: ${R - l / 2}, h: ${h}})`,                             // 3
                            `).translate([${x0}, ${y0}, ${-h}])`                                    // 4
                        ];
                        {
                            if (R - l / 2 < 0) { // R < l / 2
                                console.log(`Rowek kołowy o numerze ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}: promień ścieżki mniejszy od połowy jej szerokości, wykonanie niemożliwe ze względów geometrycznych. Obróbka nie została wykonana. `);
                                toRemove = 1;
                                break;
                            }
                            if (R - l / 2 === 0) { // R === l / 2
                                partParts[2] = ``;
                                partParts[3] = ``;
                            }
                        } // conditions
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                default:
                    console.log(`Obróbki nie istnieje. `);
                    break;
            }
        }
        // This could be automated and not called each time:
        codeParts[1] = originModel;
        mainModel = modelParts.join(`, `);
        codeParts[3] = mainModel; // manipulates with model, not function. Adds coma to model.
        centering = `.translate([${-szerokosc / 2}, ${-dlugosc / 2}, 0])`;
        codeParts[5] = centering;
        code = codeParts.join(``); // manipulates with function, not model. Doesn't add coma to function.
    },
    generateGCode: function() {
        // odczytac wymiary przygotowki, wpisac do kodu. switch do obrobek, tworzenie kodu, zapisywanie itd. Tak samo jak z kodem do OpenJSCAD, ale w kodzie G.
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
    generateCodeFromScratch: function() {
        modelParts = [];
        let [srednica, dlugosc] = przygotowka.listaWymiarow;
        modelParts.push(`cylinder({r: ${srednica / 2}, h: ${dlugosc}}).rotateX(-90)`);
        originModel = `drawOrigin([[${srednica / 2}, 0, 0], [0, ${srednica / 2}, 0], [0, 0, 0]]).rotateX(90), `;
        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            switch (i.nazwa) {
                case `toczenie wzdłużne`:
                    {
                        let [d0, d, h] = i.listaWymiarow;
                        partParts = [
                            `difference(`,
                                `cylinder({r: ${d0 / 2}, h: ${h}}), `,
                                `cylinder({r: ${d / 2}, h: ${h}})`,
                            `).rotateX(-90)`
                        ];
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                case `otwór`:
                {
                    let [d, h] = i.listaWymiarow;
                    partParts = [
                        `union(`,
                            `cylinder({r: ${d / 2}, h: ${h}}), `,
                            `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 4 * Math.tan(30 * Math.PI / 180)}}).translate([0, 0, ${h}])`,
                        `).rotateX(-90)`
                    ];
                    modelParts.push(partParts.join(``));
                    partParts = [];
                }
                    break;
                default:
                    console.log(`Obróbki nie istnieje. `);
                    break;
            }
        }
        // This could be automated and not called each time:
        codeParts[1] = originModel;
        mainModel = modelParts.join(`, `);
        codeParts[3] = mainModel; // manipulates with model, not function. Adds coma to model.
        centering = `.translate([0, ${-dlugosc / 2}, 0])`;
        codeParts[5] = centering;
        code = codeParts.join(``); // manipulates with function, not model. Doesn't add coma to function.
    },
    generateGCode: function() {
        // odczytac wymiary przygotowki, wpisac do kodu. switch do obrobek, tworzenie kodu, zapisywanie itd. Tak samo jak z kodem do OpenJSCAD, ale w kodzie G.
    },
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
function removeObrobka(obrobka) {
    przygotowka.kartaObrobki.listaObrobek.splice(przygotowka.kartaObrobki.listaObrobek.indexOf(obrobka), 1);
}

// DOM manipulations: (функции, передаваемые в nextStep и previousStep находятся вне видимости внутри функций, в которые они передаются)
function loadList(loadOf, nextStep) {

    //for "wstecz"
    clearHTML(elements.inputsList); // this line is useful only after "wstecz"
    clearHTML(elements.upperField);
    elements.upperField.appendChild(elements.choicesList); // choicesList was there already before clearing at previous line, but this should be done to enable "wstecz"

    clearHTML(elements.choicesList);
    for (let i of loadOf) {
        modifyHTML(elements.choicesList, `<li>${i.nazwa}</li>`);
    }
    for (let e of elements.choices) {
        e.addEventListener('click', nextStep);
    }
}
function loadInput(clicked, loadOf, nextStep, previousStep) {
    let variable = {};
    for (let i of loadOf) {
        if (i.nazwa === clicked.innerHTML) {
            variable = JSON.parse(JSON.stringify(i));
        }
    }
    elements.upperField.innerHTML = `${variable.opis}`;
    clearHTML(elements.inputsList);
    for (let i of variable.nazwyWymiarow) {
        modifyHTML(elements.inputsList, `
            <li>${i}<br>
            <input type="text"></li>
        `);
    }
    modifyHTML(elements.inputsList, `<button id="wstecz">Wstecz</button>`);
    modifyHTML(elements.inputsList, `<button id="getInput">Zapisz</button>`);
    elements.wstecz = document.getElementById('wstecz');
    elements.getInput = document.getElementById('getInput');
    elements.wstecz.addEventListener('click', previousStep);
    elements.getInput.addEventListener('click', nextStep);

    return variable;
}
function processInput(loadTo) {
    for (let i = 0; i < elements.inputs.length; i++) {
        loadTo.listaWymiarow[i] = elements.inputs[i].value;
    }
    if (loadTo === obrobka) { //                                                                                        проверить существует ли уже такая обрубка
        przygotowka.kartaObrobki.listaObrobek.push(loadTo);
        obrobka = {};
    }
    clearHTML(elements.inputsList);
    clearHTML(elements.upperField);
    elements.upperField.appendChild(elements.choicesList); // only a template, will be filled later
}
function proceed(obj) {
    processInput(obj); // checks for suitable input, stores input values in object, clears lower section, !rewrites upper section with choices already with listeners! . In case of obrobka, stores obrobka in przygotowka
    prepareCode.generateCodeFromScratch(); // rewrites code each time. Not much work cuz figure is redrawn anyways.
    // or
    /*
    if (obj === przygotowka) {
        prepareCode.generatePrzygotowkaCode();
    } else if (obj === obrobka) {
        prepareCode.generateObrobkaCode();
    }
     */
    if (toRemove === 1) {
        removeObrobka(obj);
        toRemove = 0;
        return;
    }
    drawModel();
}
function verifyInput(type) { // вставить его в процессИнпут, в импорте не нужен потому, что экспортировать незаполненный обьект неполучится, если эта функция будет в процессИнпут
    switch (type) { // in-code use only
        case 1: // verifies HTML input field
            for (let i = 0; i < elements.inputs.length; i++) {
                if (typeof(elements.inputs[i]) !== 'number' || elements.inputs[i] <= 0) {
                    console.log(`Wymiary muszą być w postaci dodatnich liczb. `);
                    console.log(elements.inputs);
                    // вернуться к заполнению
                    break;
                }
            }
            break;
        case 2: // verifies all objects

            for (let i of przygotowka.listaWymiarow) {
                if (typeof(i) !== 'number' || i <= 0) {
                    console.log(`Wymiary muszą być w postaci dodatnich liczb. `);
                    console.log(przygotowka.listaWymiarow);

                    // вернуться к заполнению, на один из двух этапов, но не на первые их шаги

                    // uploadHistory();
                    break;
                }
            }
            break;
        default:
            console.log(`[in-code error] bad verifyInput "type" parameter `);
            break;
    }
    // следующий шаг
} // инпут может быть нулевой, если касается координат. Проверять не ноль ли инпут только для тех, для которых реально нельзя, и делать это тогда не в processInput, а где-то в другом месте
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
function etapPrzygotowki() { // можно создать одну переменную, которая будет принимать одну из двух функций в зависимости от того, для какого она должна быть объекта

    if (Object.keys(przygotowka).length !== 0) {
        exportObject();
    }

    step1();
    function step1() {
        loadList(dostepnePrzygotowki, step2); // clears upper section, adds names, adds listeners
    }
    function step2() {
        przygotowka = loadInput(this, dostepnePrzygotowki, step3, step1); // picks object by clicked item, !rewrites upper section with "opis"! , clears lower section, adds names, input fields and a button, adds listener
    }
    function step3() {
        setFunctions();
        proceed(przygotowka);
        uploadHistory();

        etapObrobki();
    }
}
function etapObrobki() {

    step1();
    function step1() {
        loadList(przygotowka.kartaObrobki.dostepneObrobki, step2);
    }
    function step2() {
        obrobka = loadInput(this, przygotowka.kartaObrobki.dostepneObrobki, step3, step1);
    }
    function step3() {
        proceed(obrobka);
        uploadHistory();
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
       code = m3;
       drawModel();
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
    if (Object.keys(przygotowka).length === 0 || przygotowka.listaWymiarow[0] === undefined) {
        console.log(`Model pusty. `);
        return;
    }
    let a = document.createElement('a');
    a.href = "data:application/octet-stream,"+encodeURIComponent(JSON.stringify(przygotowka));
    a.download = `${przygotowka.nazwa} ${dateTimeFormat1()}.txt`;
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
        uploadHistory();
        setFunctions();
        prepareCode.generateCodeFromScratch();
        drawModel();
        switch (przygotowka.nazwa) {
            case `kostka`:
                przygotowka.kartaObrobki.dostepneObrobki = kostka.kartaObrobki.dostepneObrobki;
                break;
            case `walec`:
                przygotowka.kartaObrobki.dostepneObrobki = walec.kartaObrobki.dostepneObrobki;
                break;
            default:
                console.log(`Przygotówkę nie rozpoznano. `);
                break;
        }
        etapObrobki();
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

// History section: (listeners do not work)
function uploadHistory() {
    clearHTML(elements.history);
    modifyHTML(elements.history, `<li>${przygotowka.nazwa}</li>`);
    for (let i = 0; i < przygotowka.kartaObrobki.listaObrobek.length; i++) {
        modifyHTML(elements.history, `<li>${i + 1}. ${przygotowka.kartaObrobki.listaObrobek[i].nazwa}</li>`);
    }
    for (let e of elements.points) {
        e.addEventListener('click', () => {
            console.log(this);
        });
    }
}
function updateHistory(obj) {
    switch (obj) {
        case przygotowka: // called only once so might want to rewrite this without switching every time
            modifyHTML(elements.history, `<li>${przygotowka.nazwa}</li>`);
            break;
        case obrobka:
            modifyHTML(elements.history, `<li>${przygotowka.kartaObrobki.listaObrobek.length}. ${przygotowka.kartaObrobki.listaObrobek[przygotowka.kartaObrobki.listaObrobek.length - 1].nazwa}</li>`);
            break;
        default:
            console.log(`[in-code error] bad updateHistory "obj" parameter: `);
            console.log(obj);
            return;
    }
    elements.points[elements.points.length - 1].addEventListener('click', () => {
        console.log(this);
    });
}
