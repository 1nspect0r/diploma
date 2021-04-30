import {clearHTML, modifyHTML, dateTimeFormat} from "./auxilaryFunctions";

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
        union(`,
            originModel,
            `difference(`,
                mainModel,
            `)
        )`, centering, `;
    return model;
}
`, originFunction]; // here code for figures is stored with the functional code
let code = ``; // = codeParts.join(``) here all code is united, final entity
let gkodModelPartsParts = [];
let gkodModelParts = [];
let gkodModel = ``;
let gkodParts = [`
    ; Kod wygenerowano automatycznie w aplikacji, stanowiacej podstawe pracy dyplomowej.
    ;
    ; G94/G95 - okreslenie trybu programowania posuwu. Posuwy nalezy wpisac recznie
    G00 Z100 X100 ; dojazd w pozycje zmiany narzedzia
    ; Txxxx - wybor narzedzia z odpowiednim korektorem
    ; G96/G97 Sxxxx - okreslenie trybu i predkosci obracania wrzeciona
    ; M3/M4 - wlaczenie obrotow prawych
    ; M8 - wlaczenie chlodziwa`,
    gkodModel,
    `M30 ; koniec programu, wylaczenie obrotow wrzeciona`];
let gkod = ``;
const functionsKostka = {
    generateCodeFromScratch: function() {
        modelParts = [];
        let [szerokosc, dlugosc, wysokosc] = przygotowka.listaWymiarow;
        {
            if (szerokosc === '0' || dlugosc === '0' || wysokosc === '0') {
                report(`Wymiary nie mogą być równe 0. `);
                przygotowka = {};
                etapPrzygotowki();
                return;
            }
        } // conditions
        modelParts.push(`cube({size: [${szerokosc}, ${dlugosc}, ${wysokosc}]}).translate([0, 0, ${-wysokosc}])`);
        originModel = `drawOrigin([[${szerokosc}, 0, 0], [0, ${dlugosc}, 0], [0, 0, 0]]), `;
        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            switch (i.nazwa) {
                case `czoło`:
                    {
                        let [h] = i.listaWymiarow;
                        {
                            if (h === '0') {
                                report(`Parametr h nie może być równy 0. `);
                                toRemove = 1;
                                break;
                            }
                        } // conditions
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
                        {
                            if (d === '0' || h === '0') {
                                report(`Parametry d i h nie mogą być równa 0. `);
                                toRemove = 1;
                                partParts = [];
                                break;
                            }
                        }
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
                            if (y - 2 * r < 0 || x - 2 * r < 0) {
                                report(`Za duży promień zaokrąglenia. Obróbka nie została wykonana. `);
                                toRemove = 1; // does nothing if importing an object (which is bad), THOUGH - cannot export objects that pass in this section
                                partParts = [];
                                break;
                            }
                            if (x === '0' || y === '0' || h === '0' || r === '0') {
                                report(`Parametry x, y, h i r nie mogą być równe 0. `);
                                toRemove = 1;
                                partParts = [];
                                break;
                            }
                            if (x - 2 * r === 0) {
                                partParts[1] = ``;
                                partParts[3] = ``;
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
                        {
                            if (r === '0' || h === '0') {
                                report(`Parametry r i h nie mogą być równe 0. `);
                                toRemove = 1;
                                break;
                            }
                        }
                        modelParts.push(`cylinder({r: ${r}, h: ${h}}).translate([${x0}, ${y0}, ${-h}])`);
                    }
                    break;
                case `rowek kołowy`:
                    {
                        let [x0, y0, R, l, h] = i.listaWymiarow;
                        partParts = [                                                               // Indexes:
                            `difference(`,                                                          // 0
                                `cylinder({r: ${parseFloat(R) + parseFloat(l) / 2}, h: ${h}}), `,   // 1
                                `cylinder({r: ${R - l / 2}, h: ${h}})`,                             // 2
                            `).translate([${x0}, ${y0}, ${-h}])`                                    // 3
                        ];
                        {
                            if (R - l / 2 < 0) { // R < l / 2
                                report(`Rowek kołowy: promień ścieżki mniejszy od połowy jej szerokości, wykonanie niemożliwe ze względów geometrycznych. Obróbka nie została wykonana. `);
                                toRemove = 1;
                                partParts = [];
                                break;
                            }
                            if (R - l / 2 === 0) {
                                report(`R = 0.5l - wynikiem będzie kieszeń okrągła. Obróbka nie została wykonana. Proszę wybrać odpowiednią opcję. `);
                                toRemove = 1;
                                partParts = [];
                                break;
                            }
                            if (R === '0' || l === '0' || h === '0') {
                                report(`Parametry R, l i h nie mogą być równe 0. `);
                                toRemove = 1;
                                partParts = [];
                                break;
                            }
                        } // conditions
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                default:
                    report(`Obróbkę nie rozpoznano: ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. "${i.nazwa}". `);
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
        report(`Generowanie kodu G dostępne jedynie dla walca. `);
    }
};
const functionsWalec = {
    generateCodeFromScratch: function() {
        modelParts = [];
        let [srednica, dlugosc] = przygotowka.listaWymiarow;
        {
            if (srednica === '0' || dlugosc === '0') {
                report(`Wymiary nie mogą być równe 0. `);
                przygotowka = {};
                etapPrzygotowki();
                return;
            }
        } // conditions
        modelParts.push(`cylinder({r: ${srednica / 2}, h: ${dlugosc}})`);
        originModel = `drawOrigin([[${srednica / 2}, 0, 0], [0, ${srednica / 2}, 0], [0, 0, 0]]).rotateX(180), `;
        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            switch (i.nazwa) {
                case `toczenie`:
                    {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        partParts = [
                            `difference(`,
                                `cylinder({r: ${d0 / 2}, h: ${h}})`,
                                `, `,
                                `cylinder({r: ${d / 2}, h: ${h}})`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        {
                            if (d === '0') {
                                //partParts.splice(2, 2);
                                partParts[2] = ``;
                                partParts[3] = ``;
                            }
                            if (d0 > d || d === d0) {
                                report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                                toRemove = 1;
                                break;
                            }
                            if (d0 === '0' || h === '0') {
                                report(`Parametry d0 i h nie mogą być równe 0. `);
                                toRemove = 1;
                                partParts = [];
                                break;
                            }
                        } // conditions
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                case `otwór`:
                    {
                        let [h0, h, d] = i.listaWymiarow;
                        partParts = [
                            `union(`,
                                `cylinder({r: ${d / 2}, h: ${h}}), `,
                                `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 4 * Math.tan(30 * Math.PI / 180)}}).translate([0, 0, ${h}])`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        {
                            if (d === '0' || h === '0') {
                                report(`Parametry d i h nie mogą być równe 0. `);
                                toRemove = 1;
                                break;
                            }
                        }
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                case `fazowanie zewnętrzne`:
                    {
                        let [d, h, h0] = i.listaWymiarow;
                        partParts = [
                            `difference(`,
                                `cylinder({r: ${d / 2}, h: ${h}}), `,
                                `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 2}}).rotateX(180).translate([0, 0, ${h}])`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        {
                            if (d === '0' || h === '0') {
                                report(`Parametry d i h nie mogą być równe 0. `);
                                toRemove = 1;
                                break;
                            }
                            if (d / 2 < h) {
                                report(`Parametr h nie może być większy od połowy średnicy. Proszę zastosować toczenie. `);
                                toRemove = 1;
                                break;
                            }
                        }
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                case `fazowanie wewnętrzne`:
                    {
                        let [d, h, h0] = i.listaWymiarow;
                        partParts = [
                            `intersection(`,
                                `cylinder({r: ${(parseFloat(d) / 2 + parseFloat(h))}, h: ${h}}), `,
                                `cylinder({r1: ${(parseFloat(d) / 2 + parseFloat(h))}, r2: 0, h: ${(parseFloat(d) / 2 + parseFloat(h))}})`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        {
                            if (d === '0' || h === '0') {
                                report(`Parametry d i h nie mogą być równe 0. `);
                                toRemove = 1;
                                break;
                            }
                        }
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                case `rowek wzdłużny`:
                    {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        partParts = [
                            `difference(`,
                                `cylinder({r: ${d0 / 2}, h: ${h}}), `,
                                `cylinder({r: ${d / 2}, h: ${h}})`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        {
                            if (d0 === '0' || h === '0') {
                                report(`Parametry d0 i h nie mogą być równe 0. `);
                                toRemove = 1;
                                break;
                            }
                            if (d0 > d || d === d0) { // nie wiem dlaczego, ale to działa tak, a nie d0 < d.
                                report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                                toRemove = 1;
                                break;
                            }
                        }
                        modelParts.push(partParts.join(``));
                        partParts = [];
                    }
                    break;
                case `rowek czołowy`:
                {
                    let [d0, d, h0, h] = i.listaWymiarow;
                    partParts = [
                        `difference(`,
                        `cylinder({r: ${d0 / 2}, h: ${h}}), `,
                        `cylinder({r: ${d / 2}, h: ${h}})`,
                        `).translate([0, 0, ${h0}])`
                    ];
                    {
                        if (d0 === '0' || h === '0') {
                            report(`Parametry d0 i h nie mogą być równe 0. `);
                            toRemove = 1;
                            break;
                        }
                        if (d0 < d || d === d0) {
                            report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                            toRemove = 1;
                            break;
                        }
                    }
                    modelParts.push(partParts.join(``));
                    partParts = [];
                }
                    break;
                default:
                    report(`Obróbkę nie rozpoznano: ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. "${i.nazwa}". `);
                    break;
            }
        }
        // This could be automated and not called each time:
        codeParts[1] = originModel;
        mainModel = modelParts.join(`, `);
        codeParts[3] = mainModel; // manipulates with model, not function. Adds coma to model.
        centering = `.rotateX(-90).translate([0, ${-dlugosc / 2}, 0])`;
        codeParts[5] = centering;
        code = codeParts.join(``); // manipulates with function, not model. Doesn't add coma to function.
    },
    generateGCode: function() {
        if (Object.keys(przygotowka).length === 0 || przygotowka.listaWymiarow[0] === undefined || przygotowka.kartaObrobki.listaObrobek[0] === undefined || przygotowka.kartaObrobki.listaObrobek[0].listaWymiarow[0] === undefined) {
            report(`Próba wygenerować kod G. Model pusty. `);
            return;
        }
        gkodModelParts = [];
        let [srednica, dlugosc] = przygotowka.listaWymiarow;
        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            switch (i) {
                case `toczenie`:
                    {
                        let [d0, d, h0, h, dx] = i.listaWymiarow;
                        /*
                        gkodModelPartsParts = [
                            `; Txxxx
                            G00 Z01 X${parseFloat(srednica) + 2}
                            `,
                            `G00 Z${- parseFloat(h0) + 1}
                            G90 U${dx} W${- parseFloat(h) + 1}
                            `,
                            `G01 `,
                            ``
                        ];
                        gkodModelParts.push(gkodModelPartsParts.join(``));
                        gkodModelPartsParts = [];
                        */
                        gkodModelParts.push(`; kod toczenia`);
                    }
                    break;
                case `otwór`:
                    {
                        let [d, h] = i.listaWymiarow;
                        gkodModelParts.push(`; kod wiercenia otworu`);
                    }
                    break;
                case `fazowanie zewnętrzne`:
                    {
                        let [d, h, h0] = i.listaWymiarow;
                        gkodModelParts.push(`; kod fazowania zewnetrznego`);
                    }
                    break;
                case `fazowanie wewnętrzne`:
                    {
                        let [d, h, h0] = i.listaWymiarow;
                        gkodModelParts.push(`; kod fazowania wewnetrznego`);
                    }
                    break;
                case `rowek wzdłużny`:
                    {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        gkodModelParts.push(`; kod toczenia rowka wzdluznego`);
                    }
                    break;
                case `rowek czołowy`:
                    {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        gkodModelParts.push(`; kod toczenia rowka czolowego`);
                    }
                    break;
                default:
                    report(`Obróbkę nie rozpoznano: ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. "${i.nazwa}". `);
                    break;
            }
        }
        gkodModel = gkodModelParts.join(`
        `);
        gkodParts[1] = gkodModel;
        gkod = gkodParts.join(`
        `);
        let a = document.createElement('a');
        a.href = "data:application/octet-stream,"+encodeURIComponent(gkod);
        a.download = `g-code ${przygotowka.nazwa} (${dateTimeFormat(1)}).txt`;
        a.click();
    },
};
let prepareCode = {}; // functions for generating OpenJSCAD code are stored here in the form of methods. Becomes one of two objects with same methods for different code-writing purposes depending on przygotowka
function setFunctions() {
    switch (przygotowka.nazwa) {
        case `kostka`:
            prepareCode = { ...functionsKostka };
            report(`Ustawiono funkcje dla kostki. `);
            break;
        case `walec`:
            prepareCode = { ...functionsWalec };
            report(`Ustawiono funkcje dla walca. `);
            break;
        default:
            report(`Nie ustalono przygotówki. `);
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
function verifyInput() { // вставить его в процессИнпут или в проксид, в общем только в эту область (сразу после создания обьекта)
    for (let i = 0; i < elements.inputs.length; i++) {
        if (typeof(elements.inputs[i]) !== 'number' || elements.inputs[i] <= 0) {
            report(`Wymiary muszą być w postaci dodatnich liczb. `);
            report(elements.inputs);
            // вернуться к заполнению
            break;
        }
    }
    // следующий шаг
}
function report(msg) {
    elements.console_log.innerHTML += `<li>${msg} [${dateTimeFormat(2)}]</li>`;
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
    elements.btnGenerateGCode.addEventListener('click', function() {
        prepareCode.generateGCode();
        //code = m3;
        //drawModel();
    });
    elements.btnExport.addEventListener('click', exportObject);
    elements.inputFile.addEventListener('change', importObject);
    // Class "viewsList":
    /*
    for (let i = 0; i < elements.views.length; i++) {
        elements.views[i].addEventListener('click', selectPerspective);
    }
    */
    // Class "footer":
}
    // document.addEventListener("DOMContentLoaded", function() {
bindListeners();
    // });

// Exports and imports:
function exportObject() {
    if (Object.keys(przygotowka).length === 0 || przygotowka.listaWymiarow[0] === undefined) {
        report(`Próba eksportować model. Model pusty. `);
        return;
    }
    let a = document.createElement('a');
    a.href = "data:application/octet-stream,"+encodeURIComponent(JSON.stringify(przygotowka));
    a.download = `${przygotowka.nazwa} (${dateTimeFormat(1)}).txt`;
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
            report('Próba importować model. Plik pusty. ');
            code = ``;
            drawModel();
            return;
        }
        report(`Przygotówkę załadowano. `);
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
                report(`Przygotówkę nie rozpoznano: "${przygotowka.nazwa}". `);
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
            report(`Nieprawidłowy format importowanego pliku.
Akceptowalny format: ${dostepnePrzygotowki[0].displayInfo()}
Format wgranego pliku: ${przygotowka.displayInfo()}`);
        }*/
    }).catch(error => {
        console.log(error);
        report(`Błąd odczytu pliku. `);
    });
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

// History section:
function uploadHistory() {
    clearHTML(elements.history);
    modifyHTML(elements.history, `<li>${przygotowka.nazwa}</li>`);
    for (let i = 0; i < przygotowka.kartaObrobki.listaObrobek.length; i++) {
        modifyHTML(elements.history, `<li>${i + 1}. ${przygotowka.kartaObrobki.listaObrobek[i].nazwa}</li>`);
    }
    /*
    for (let e of elements.points) {
        e.addEventListener('click', catchFromHistory);
    }
    */
}
/*
function catchFromHistory() {
    console.log(this);
}
*/
/*
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
            report(`Błąd przy modyfikacji historii. `);
            return;
    }
    elements.points[elements.points.length - 1].addEventListener('click', () => {
        console.log(this);
    });
}
*/
