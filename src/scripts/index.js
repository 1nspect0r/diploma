/* For a better experience:
 * 1) use the method insertAdjacentHTML() to insert the HTML into the document
 *
 */

import {clearHTML, modifyHTML, dateTimeFormat} from "./auxilaryFunctions";

// noinspection SpellCheckingInspection
const kostka = require('./kostka').kostka;
const walec = require('./walec').walec;
const elements = require('./elements.js');
const processor = require('./cad').gProcessor;
const originFunction = require('../models/origin-function');
const helperPage = require('./helper-page');
//const kostkaOpisy = require('./kostka').opisy;
//const walecOpisy = require('./walec').opisy;


// Main object storing:
let obrobka = {}; // changes completely each time a new obrobka is added, stores obrobka and is pushed to "listaObrobek" array in "przygotowka" object
let przygotowka = {}; // the main object
const dostepnePrzygotowki = [kostka, walec];
let toRemove = 0; // acquires 1 when current processing "obrobka" should and will be removed
//let opisy = [kostkaOpisy[0], walecOpisy[0]]; // keep the order! same as dostepnePrzygotowki
//let nazwy = [`kostka`, `walec`]; // keep the order! same as dostepnePrzygotowki


// OpenJSCAD and G-code manipulations:
let openjscadModelParts2 = []; // filled each time a part is drawn, .join and .push to "openjscadModelParts1", then cleared. Should be filled with commas manually!
let openjscadModelParts1 = []; // here code for parts is stored (one array element stores code for one part with translations)
let openjscadModel = ``; // "openjscadModelParts1.join(', ')"
let openjscadOrigin = ``; // calls "originFunction" inside OpenJSCAD code
let openjscadCentering = ``; // centers model on a screen depending on its dimensions
let openjscadCodeParts = [`
function main() {
    let model =
        union(`,
    openjscadOrigin,
    `difference(`,
    openjscadModel,
    `)
        )`, openjscadCentering, `;
    return model;
}
`, originFunction]; // here code for parts is stored within a draft for OpenJSCAD to function
let openjscadCode = ``; // "openjscadCodeParts.join(``)", final entity, is launched to OpenJSCAD

let gCodeMainParts2 = [];
let gCodeMainParts1 = [];
let gCodeMain = ``;
let gCodeParts = [`
                                                                    (Kod wygenerowano automatycznie w aplikacji, stanowiacej podstawe pracy dyplomowej)
                                                                    G54`,
    gCodeMain
];
let gCode = ``;

let offsetTracker = 0; // a risky thing

const actionsKostka = {
    checkValues: function (here) {
        switch (here.nazwa) {
            case `kostka`:
                for (let i of here.listaWymiarow) {
                    if (i === 0) {
                        report(`Wymiary nie mogą być równe 0. `);
                        przygotowka = {};
                        etapPrzygotowki();
                        toRemove = 1;
                    }
                }
                break;
            case `czoło`: {
                let [h, fi, g, f] = here.listaWymiarow;
                for (let i of [h, fi, g, f]) {
                    if (i === 0) {
                        report(`Parametry "h", średnica narzędzia, grubość przejścia w Z i "f" nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (h > przygotowka.listaWymiarow[2]) {
                    report(`Parametr h nie może być większy niż wysokość kostki. `);
                    toRemove = 1;
                }
                if (h <= offsetTracker) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
                if (g > h) {
                    report(`Głębokość przejścia nie może być większa niż grubość warstwy. `);
                    toRemove = 1;
                }
            }
                break;
            case `otwór`: {
                let [x, y, d, h, f] = here.listaWymiarow;
                for (let i of [d, h, f]) {
                    if (i === 0) {
                        report(`Parametry "d", "h" i "f" nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (h <= offsetTracker) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
            }
                break;
            case `kieszeń prostokątna`: {
                let [x0, y0, x, y, h, r, g, f] = here.listaWymiarow;
                for (let i of [x, y, h, r, g, f]) {
                    if (i === 0) {
                        report(`Parametry "x", "y", "h", "r", grubość przejścia w Z i "f" nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (y - 2 * r < 0 || x - 2 * r < 0) {
                    report(`Za duży promień zaokrąglenia. Obróbka nie została wykonana. `);
                    toRemove = 1; // does nothing if importing an object (which is bad), THOUGH - cannot export objects that pass in this section
                }
                if (h <= offsetTracker) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
                if (x === 2 * r && x === y) {
                    report(`Należy wybrać obróbkę "otwór" lub "kieszeń okrągła". `);
                    toRemove = 1;
                }
                if (g > h) {
                    report(`Głębokość przejścia nie może być większa niż głębokość kieszeni. `);
                    toRemove = 1;
                }
            }
                break;
            case `kieszeń okrągła`: {
                let [x0, y0, r, h, fi, g, f] = here.listaWymiarow;
                for (let i of [r, h, fi, g, f]) {
                    if (i === 0) {
                        report(`Parametry "r", "h", średnica narzędzia, grubość przejścia w Z i "f" nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (h <= offsetTracker) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
                if (fi === 2 * r) {
                    report(`Średnica narzędzia jest równa średnicy kieszeni. Należy wybrać obróbkę "otwór". `);
                    toRemove = 1;
                }
                if (fi > 2 * r) {
                    report(`Średnica narzędzia nie może być większa niż średnica kieszeni. `);
                    toRemove = 1;
                }
                if (g > h) {
                    report(`Głębokość przejścia nie może być większa niż głębokość kieszeni. `);
                    toRemove = 1;
                }
            }
                break;
            case `rowek kołowy`: {
                let [x0, y0, R, l, h, fi, g, f] = here.listaWymiarow;
                for (let i of [R, l, h, fi, g, f]) {
                    if (i === 0) {
                        report(`Parametry "R", "l", "h", średnica narzędzia, grubość przejścia w Z i "f" nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (R - l / 2 < 0) { // R < l / 2
                    report(`Rowek kołowy: promień ścieżki mniejszy od połowy jej szerokości, wykonanie niemożliwe ze względów geometrycznych. Obróbka nie została wykonana. `);
                    toRemove = 1;
                }
                if (R - l / 2 === 0) {
                    report(`R = 0.5l - wynikiem będzie kieszeń okrągła. Obróbka nie została wykonana. Proszę wybrać odpowiednią opcję. `);
                    toRemove = 1;
                }
                if (h <= offsetTracker) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
                if (fi > l) {
                    report(`Średnica narzędzia nie może być większa od szerokości rowka. `);
                    toRemove = 1;
                }
                if (g > h) {
                    report(`Głębokość przejścia nie może być większa niż głębokość rowka. `);
                    toRemove = 1;
                }
            }
                break;
            default:
                report(`functionsKostka -> checkValues -> switch default (${here.nazwa})`);
                break;
        }
    },
    generateCodeFromScratch: function () {

        let [szerokosc, dlugosc, wysokosc] = przygotowka.listaWymiarow;
        openjscadModelParts1 = [];
        openjscadModelParts1.push(`cube({size: [${szerokosc}, ${dlugosc}, ${wysokosc}]}).translate([0, 0, ${-wysokosc}])`);
        openjscadOrigin = `drawOrigin([[${szerokosc}, 0, 0], [0, ${dlugosc}, 0], [0, 0, 0]]), `;
        openjscadCentering = `.translate([${-szerokosc / 2}, ${-dlugosc / 2}, 0])`;

        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            if (przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
                offsetTracker = 0;
                switch (i.nazwa) {
                    case `czoło`: {
                        let [h] = i.listaWymiarow;
                        openjscadModelParts1.push(`cube({size: [${szerokosc}, ${dlugosc}, ${h}]}).translate([0, 0, ${-h}])`);
                        offsetTracker = h;
                    }
                        break;
                    case `otwór`: {
                        let [x, y, d, h] = i.listaWymiarow;
                        openjscadModelParts2 = [
                            `union(`,
                            `cylinder({r: ${d / 2}, h: ${h}}), `,
                            `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 4 * Math.tan(30 * Math.PI / 180)}}).rotateY(180)`,
                            `).translate([${x}, ${y}, ${-h}])`
                        ];
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    case `kieszeń prostokątna`: {
                        let [x0, y0, x, y, h, r] = i.listaWymiarow;
                        openjscadModelParts2 = [                                                                   // Indexes:
                            `union(`,                                                                   // 0
                            `cube({size: [${x - 2 * r}, ${y}, ${h}]}).translate([${r}, 0, 0]), `,   // 1
                            `cube({size: [${x}, ${y - 2 * r}, ${h}]}).translate([0, ${r}, 0]), `,   // 2
                            `cylinder({r: ${r}, h: ${h}}).translate([${x - r}, ${y - r}, 0]), `,    // 3
                            `cylinder({r: ${r}, h: ${h}}).translate([${x - r}, ${r}, 0]), `,        // 4
                            `cylinder({r: ${r}, h: ${h}}).translate([${r}, ${y - r}, 0]), `,        // 5
                            `cylinder({r: ${r}, h: ${h}}).translate([${r}, ${r}, 0])`,              // 6
                            `).translate([${x0}, ${y0}, ${-h}])`                                        // 7
                        ];
                        if (x - 2 * r === 0) {
                            openjscadModelParts2[1] = ``;
                            openjscadModelParts2[3] = ``;
                            openjscadModelParts2[4] = ``;
                        }
                        if (y - 2 * r === 0) {
                            openjscadModelParts2[2] = ``;
                            openjscadModelParts2[3] = ``;
                            openjscadModelParts2[5] = ``;
                        }
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    case `kieszeń okrągła`: {
                        let [x0, y0, r, h] = i.listaWymiarow;
                        openjscadModelParts1.push(`cylinder({r: ${r}, h: ${h}}).translate([${x0}, ${y0}, ${-h}])`);
                    }
                        break;
                    case `rowek kołowy`: {
                        let [x0, y0, R, l, h] = i.listaWymiarow;
                        openjscadModelParts2 = [                                                               // Indexes:
                            `difference(`,                                                          // 0
                            `cylinder({r: ${parseFloat(R) + parseFloat(l) / 2}, h: ${h}}), `,   // 1
                            `cylinder({r: ${R - l / 2}, h: ${h}})`,                             // 2
                            `).translate([${x0}, ${y0}, ${-h}])`                                    // 3
                        ];
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    default:
                        report(`Obróbkę nie rozpoznano: ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. "${i.nazwa}". `);
                        break;
                }
            }
        }

        // This could be automated and not called each time:
        openjscadModel = openjscadModelParts1.join(`, `);
        openjscadCodeParts[1] = openjscadOrigin;
        openjscadCodeParts[3] = openjscadModel; // manipulates with model, not function. Adds coma to model.
        openjscadCodeParts[5] = openjscadCentering;
        openjscadCode = openjscadCodeParts.join(``); // manipulates with function, not model. Doesn't add coma to function.
    },
    highlight: function (target) {

        let [szerokosc, dlugosc, wysokosc] = przygotowka.listaWymiarow;
        openjscadModelParts1 = [];

        switch (target.nazwa) {
            case `czoło`: {
                let [h] = target.listaWymiarow;
                openjscadModelParts1.push(`cube({size: [${szerokosc}, ${dlugosc}, ${h}]}).translate([0, 0, ${-h}])`);
            }
                break;
            case `otwór`: {
                let [x, y, d, h] = target.listaWymiarow;
                openjscadModelParts2 = [
                    `union(`,
                    `cylinder({r: ${d / 2}, h: ${h}}), `,
                    `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 4 * Math.tan(30 * Math.PI / 180)}}).rotateY(180)`,
                    `).translate([${x}, ${y}, ${-h}])`
                ];
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            case `kieszeń prostokątna`: {
                let [x0, y0, x, y, h, r] = target.listaWymiarow;
                openjscadModelParts2 = [                                                                   // Indexes:
                    `union(`,                                                                   // 0
                    `cube({size: [${x - 2 * r}, ${y}, ${h}]}).translate([${r}, 0, 0]), `,   // 1
                    `cube({size: [${x}, ${y - 2 * r}, ${h}]}).translate([0, ${r}, 0]), `,   // 2
                    `cylinder({r: ${r}, h: ${h}}).translate([${x - r}, ${y - r}, 0]), `,    // 3
                    `cylinder({r: ${r}, h: ${h}}).translate([${x - r}, ${r}, 0]), `,        // 4
                    `cylinder({r: ${r}, h: ${h}}).translate([${r}, ${y - r}, 0]), `,        // 5
                    `cylinder({r: ${r}, h: ${h}}).translate([${r}, ${r}, 0])`,              // 6
                    `).translate([${x0}, ${y0}, ${-h}])`                                        // 7
                ];
                if (x - 2 * r === 0) {
                    openjscadModelParts2[1] = ``;
                    openjscadModelParts2[3] = ``;
                    openjscadModelParts2[4] = ``;
                }
                if (y - 2 * r === 0) {
                    openjscadModelParts2[2] = ``;
                    openjscadModelParts2[3] = ``;
                    openjscadModelParts2[5] = ``;
                }
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            case `kieszeń okrągła`: {
                let [x0, y0, r, h] = target.listaWymiarow;
                openjscadModelParts1.push(`cylinder({r: ${r}, h: ${h}}).translate([${x0}, ${y0}, ${-h}])`);
            }
                break;
            case `rowek kołowy`: {
                let [x0, y0, R, l, h] = target.listaWymiarow;
                openjscadModelParts2 = [                                                               // Indexes:
                    `difference(`,                                                          // 0
                    `cylinder({r: ${parseFloat(R) + parseFloat(l) / 2}, h: ${h}}), `,   // 1
                    `cylinder({r: ${R - l / 2}, h: ${h}})`,                             // 2
                    `).translate([${x0}, ${y0}, ${-h}])`                                    // 3
                ];
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            default:
                report(`Obróbkę nie rozpoznano: ${przygotowka.kartaObrobki.listaObrobek.indexOf(target) + 1}. "${target.nazwa}". `);
                break;
        }

        // This could be automated and not called each time:
        openjscadModel = openjscadModelParts1.join(`, `);
        openjscadCodeParts[3] = openjscadModel; // manipulates with model, not function. Adds coma to model.
        openjscadCode = openjscadCodeParts.join(``); // manipulates with function, not model. Doesn't add coma to function.
    },
    generateGCode: function () {

        let [szerokoscKostki, dlugoscKostki, wysokoscKostki, S] = przygotowka.listaWymiarow;
        gCodeMainParts1 = [];
        gCodeMainParts1.push(`
                                                                    (G94/G95 - okreslenie trybu programowania posuwu [mm/min]/[mm/obr])
                                                                    G90
                                                                    G28 U0 W0 (dojazd w pozycje zmiany narzedzia)`);

        let offset = 0;

        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            if (przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
                switch (i.nazwa) {
                    case `czoło`: { //checked, correct
                        let [h, fi, g, f] = i.listaWymiarow;
                        h = h - offset;
                        gCodeMainParts2 = [
                            `(obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - czolo)`,
                            `(Txxxx M6 - wybor narzedzia o srednicy ${fi} mm i wymiana)`,
                            `S${S * 1}`,
                            `G00 X${-(fi / 2)} Y${fi / 2}`,
                            `Z1`,
                            `G91 M3 F${f}`
                        ];

                        let przejscia_Z = h / g;
                        let przejscia_Y = dlugoscKostki / fi;
                        let znak = 1;

                        for (let i = 0; i < przejscia_Z; i++) {

                            if (i <= przejscia_Z - 1) {
                                gCodeMainParts2.push(`
                                                                    G01 Z${-(g + 1)}`);
                            } else {
                                gCodeMainParts2.push(`
                                                                    G01 Z${-(calculateRemainder(h, g) + 1)}`);
                            }

                            for (let j = 1; j < przejscia_Y; j++) { // j = 1 because the last line is out of this loop
                                gCodeMainParts2.push(`
                                                                    X${znak * (szerokoscKostki + fi)}
                                                                    Y${fi}`);
                                znak *= -1;
                            }
                            gCodeMainParts2.push(`
                                                                    X${znak * (szerokoscKostki + fi)}`);

                            if (i <= przejscia_Z - 1) {
                                if (znak === -1) {
                                    gCodeMainParts2.push(`
                                                                    G00 Y${-(Math.ceil(przejscia_Y) * fi)} Z1`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G00 X${-(szerokoscKostki + fi)} Y${-(Math.ceil(przejscia_Y) * fi)} Z1`);
                                }
                            } else {
                                gCodeMainParts2.push(`
                                                                    G00 Z1
                                                                    (w tym momencie plaszczyzna XY przemieszcza sie do gornej powierzchni kostki)`);
                            }
                        }

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];

                        offset += h;
                    }
                        break;
                    case `otwór`: {
                        let [x, y, d, h, f] = i.listaWymiarow;
                        h = h - offset;
                        gCodeMainParts2 = [
                            `(obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - otwor)`,
                            `(Txxxx M6 - wybor narzedzia o srednicy ${d} mm i wymiana)`,
                            `S${S * 0.6}`,
                            `G00 X${x} Y${y}`,
                            `Z1`,
                            `G91 M3`,
                            `G01 Z${-(h + 1)} F${f}`,
                            `Z${h + 1}`
                        ];

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                            `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `kieszeń prostokątna`: {
                        let [x0, y0, x, y, h, r, gruboscPrzejscia, f] = i.listaWymiarow;
                        h = h - offset;
                        gCodeMainParts2.push(`
                                                                    (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - kieszen prostokatna)
                                                                    (Txxxx M6 - wybor narzedzia o srednicy ${2 * r} mm i wymiana)
                                                                    S${S * 0.9}
                                                                    G00 X${x0 + r} Y${y0 + r}
                                                                    Z1
                                                                    G91 M3 F${f}`);

                        let przejscia_Z = h / gruboscPrzejscia;
                        let przejscia_Y = y / (2 * r);
                        let znak = 1;
                        if (x === 2 * r) {
                            for (let i = 0; i < przejscia_Z; i++) {
                                if (i <= przejscia_Z - 1) {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(gruboscPrzejscia + 1)}`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(calculateRemainder(h, gruboscPrzejscia) + 1)}`);
                                }

                                gCodeMainParts2.push(`
                                                                    Y${y - 2 * r}`);

                                if (i < przejscia_Z - 1) {
                                    gCodeMainParts2.push(`
                                                                    Z1
                                                                    Y${-(y - 2 * r)}`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    Z${h}
                                                                    G00 Z1`);
                                }
                            }
                        } else if (y === 2 * r) {
                            for (let i = 0; i < przejscia_Z; i++) {
                                if (i <= przejscia_Z - 1) {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(gruboscPrzejscia + 1)}`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(calculateRemainder(h, gruboscPrzejscia) + 1)}`);
                                }

                                gCodeMainParts2.push(`
                                                                    X${x - 2 * r}`);

                                if (i < przejscia_Z - 1) {
                                    gCodeMainParts2.push(`
                                                                    Z1
                                                                    X${-(x - 2 * r)}`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    Z${h}
                                                                    G00 Z1`);
                                }
                            }
                        } else {
                            for (let i = 0; i < przejscia_Z; i++) {
                                if (i <= przejscia_Z - 1) {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(gruboscPrzejscia + 1)}`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(calculateRemainder(h, gruboscPrzejscia) + 1)}`);
                                }

                                gCodeMainParts2.push(`
                                                                    X${znak * (x - 2 * r)}`);

                                for (let j = 1; j < przejscia_Y; j++) {
                                    znak *= -1;
                                    if (j <= przejscia_Y - 1) {
                                        gCodeMainParts2.push(`
                                                                    Y${2 * r}
                                                                    X${znak * (x - 2 * r)}`);
                                    } else {
                                        gCodeMainParts2.push(`
                                                                    Y${calculateRemainder(y, 2 * r)}
                                                                    X${znak * (x - 2 * r)}`);
                                    }
                                }
                                if (znak === -1) { // 4th corner (corners are anti clockwise)
                                    gCodeMainParts2.push(`
                                                                    Y${-(y - 2 * r)}
                                                                    X${x - 2 * r}
                                                                    Y${y - 2 * r}`);
                                } else { // 3rd corner
                                    gCodeMainParts2.push(`
                                                                    Y${-(y - 2 * r)}
                                                                    X${-(x - 2 * r)}
                                                                    Y${y - 2 * r}`);
                                }

                                if (i < przejscia_Z - 1) {
                                    if (znak === -1) {
                                        gCodeMainParts2.push(`
                                                                    Z1
                                                                    G00 X${-(x - 2 * r)} Y${-(y - 2 * r)}`);
                                    } else {
                                        gCodeMainParts2.push(`
                                                                    Z1
                                                                    G00 Y${-(y - 2 * r)}`);
                                    }
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G00 X${znak * (x / 2 - r)} Y${-(y / 2 - r)} Z${h + 1}`);
                                }
                            }
                        }

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                            `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `kieszeń okrągła`: {
                        let [x0, y0, r, h, srednicaNarzedzia, gruboscPrzejscia, f] = i.listaWymiarow;
                        h = h - offset;
                        gCodeMainParts2.push(`
                                                                    (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - kieszen okragla)
                                                                    (Txxxx M6 - wybor narzedzia o srednicy ${srednicaNarzedzia} mm i wymiana)
                                                                    S${S * 0.8}`);
                        if (srednicaNarzedzia / 2 >= r) {
                            gCodeMainParts2.push(`
                                                                    G00 X${x0 + r - srednicaNarzedzia / 2} Y${y0}
                                                                    Z1
                                                                    G91 M3 F${f}`);
                            let przejscia_Z = h / gruboscPrzejscia;
                            for (let i = 0; i < przejscia_Z; i++) {
                                if (i <= przejscia_Z - 1) {
                                gCodeMainParts2.push(`
                                                                    G01 Z${-(gruboscPrzejscia + 1)}
                                                                    G02 G17 X0 Y0 I${-(r - srednicaNarzedzia / 2)} J0`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(calculateRemainder(h, gruboscPrzejscia) + 1)}
                                                                    G02 G17 X0 Y0 I${-(r - srednicaNarzedzia / 2)} J0`);
                                }
                            }

                            break;
                        } else {
                            gCodeMainParts2.push(`
                                                                    G00 X${x0 + srednicaNarzedzia / 2} Y${y0}
                                                                    Z1
                                                                    G91 M3 F${f}`);
                        }

                        let przejscia_Z = h / gruboscPrzejscia;
                        let przejscia_XY = (2 * r) / (2 * srednicaNarzedzia);

                        for (let i = 0; i < przejscia_Z; i++) {
                            if (i <= przejscia_Z - 1) {
                                gCodeMainParts2.push(`
                                                                    G01 Z${-(gruboscPrzejscia + 1)}
                                                                    G02 G17 X0 Y0 I${-(srednicaNarzedzia / 2)} J0`);
                            } else {
                                gCodeMainParts2.push(`
                                                                    G01 Z${-(calculateRemainder(h, gruboscPrzejscia) + 1)}
                                                                    G02 G17 X0 Y0 I${-(srednicaNarzedzia / 2)} J0`);
                            }

                            for (let j = 1; j < przejscia_XY; j++) {
                                if (j <= przejscia_XY - 1) {
                                    gCodeMainParts2.push(`
                                                                    G01 X${srednicaNarzedzia}
                                                                    G02 G17 X0 Y0 I${-(j * srednicaNarzedzia + (srednicaNarzedzia / 2))} J0`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G01 X${calculateRemainder(2 * r, 2 * srednicaNarzedzia) / 2}
                                                                    G02 G17 X0 Y0 I${-(r - (srednicaNarzedzia / 2))} J0`);
                                }
                            }

                            if (i < przejscia_Z - 1) {
                                gCodeMainParts2.push(`
                                                                    G00 X${-(r - (srednicaNarzedzia / 2))} Z1`);
                            } else {
                                gCodeMainParts2.push(`
                                                                    G00 X${-(r - (srednicaNarzedzia / 2))} Z${h + 1}`);
                            }
                        }

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                            `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `rowek kołowy`: {
                        let [x0, y0, R, l, h, srednicaNarzedzia, gruboscPrzejscia, f] = i.listaWymiarow;
                        h = h - offset;
                        let wejscieX = x0 + R - l / 2 + srednicaNarzedzia / 2;
                        gCodeMainParts2.push(`
                                                                    (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek kolowy)
                                                                    (Txxxx M6 - wybor narzedzia o srednicy ${srednicaNarzedzia} mm i wymiana)
                                                                    S${S * 0.8}
                                                                    G00 X${wejscieX} Y${y0}
                                                                    Z1
                                                                    G91 M3 F${f}`);

                        let przejscia_Z = h / gruboscPrzejscia;
                        let przejscia_XY = l  / srednicaNarzedzia;
                        if (l === srednicaNarzedzia) {
                            gCodeMainParts2.push(`
                                                                    G01 Z${-(gruboscPrzejscia + 1)}
                                                                    G02 G17 X0 Y0 I${-R} J0`);
                            for (let i = 1; i < przejscia_Z; i++) {
                                if (i <= przejscia_Z - 1) {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-gruboscPrzejscia}
                                                                    G02 G17 X0 Y0 I${-R} J0`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-1 * calculateRemainder(h, gruboscPrzejscia)}
                                                                    G02 G17 X0 Y0 I${-R} J0`);
                                }
                            }
                            gCodeMainParts2.push(`
                                                                    G01 Z${h + 1}`);
                        } else {
                            for (let i = 0; i < przejscia_Z; i++) {
                                if (i <= przejscia_Z - 1) {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(gruboscPrzejscia + 1)}
                                                                    G02 G17 X0 Y0 I${-(wejscieX - x0)} J0`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G01 Z${-(calculateRemainder(h, gruboscPrzejscia) + 1)}
                                                                    G02 G17 X0 Y0 I${-(wejscieX - x0)} J0`);
                                }
                                for (let j = 1; j < przejscia_XY; j++) {
                                    if (j <= przejscia_XY - 1) {
                                        gCodeMainParts2.push(`
                                                                    G01 X${srednicaNarzedzia}
                                                                    G02 G17 X0 Y0 I${-(wejscieX - x0 + j * srednicaNarzedzia)} J0`);
                                    } else {
                                        gCodeMainParts2.push(`
                                                                    G01 X${calculateRemainder(l - srednicaNarzedzia, srednicaNarzedzia)}
                                                                    G02 G17 X0 Y0 I${-(R + l / 2 - srednicaNarzedzia / 2)} J0`);
                                    }
                                }
                                if (i < przejscia_Z - 1) {
                                    gCodeMainParts2.push(`
                                                                    G00 X${-(l - srednicaNarzedzia)} Z1`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                    G00 X${-(l / 2 - srednicaNarzedzia / 2)} Z${h + 1}`);
                                }
                            }
                        }

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                            `));
                        gCodeMainParts2 = [];
                    }
                        break;
                }
                gCodeMainParts1.push(`
                                                                    G90
                                                                    G28 U0 W0 (dojazd w pozycje zmiany narzedzia)`);
            } else {
                switch (i.nazwa) {
                    case `czoło`:
                        gCodeMainParts1.push(`
                                (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - czolo - wykluczono)`);
                        break;
                    case `otwór`:
                        gCodeMainParts1.push(`
                                (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - otwor - wykluczono)`);
                        break;
                    case `kieszeń prostokątna`:
                        gCodeMainParts1.push(`
                                (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - kieszen prostokatna - wykluczono)`);
                        break;
                    case `kieszeń okrągła`:
                        gCodeMainParts1.push(`
                                (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - kieszen okragla - wykluczono)`);
                        break;
                    case `rowek kołowy`:
                        gCodeMainParts1.push(`
                                (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek kolowy - wykluczono)`);
                        break;
                }
            }
        }

        gCodeMainParts1.push(`
                                                                    M30`);

        gCodeMain = gCodeMainParts1.join(`
        `);
        gCodeParts[1] = gCodeMain;
        gCode = gCodeParts.join(`
        `).replaceAll(/ {2}/ig, '').replaceAll('\n\n', '\n').trim();
    }
};

const actionsWalec = {
    checkValues: function (here) {
        switch (here.nazwa) {
            case `walec`:
                for (let i of here.listaWymiarow) {
                    if (i === 0) {
                        report(`Wymiary oraz prędkość nie mogą być równe 0. `);
                        przygotowka = {};
                        etapPrzygotowki();
                        toRemove = 1;
                    }
                }
                break;
            case `toczenie`: {
                let [d0, d, h0, h, dx, u, w, f1, f2, s] = here.listaWymiarow;
                if (d0 < d || d === d0) {
                    report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                    toRemove = 1;
                }
                for (let i of [d0, h, dx, f1, f2, s]) {
                    if (i === 0) {
                        report(`Parametry "d0", "h", "dx", "f (zgr)", "f (wyk)" oraz prędkość nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
            }
                break;
            case `otwór`: {
                let [h0, h, d, r, q, f, s] = here.listaWymiarow;
                for (let i of [d, h, r, q, f, s]) {
                    if (i === 0) {
                        report(`Parametry "d", "h", "r", "q", "f" oraz prędkość nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (s >= przygotowka.listaWymiarow[2]) {
                    report(`Wpisana prędkość obrotowa przekracza maksymalną. `);
                    toRemove = 1;
                }
            }
                break;
            case `fazowanie zewnętrzne`: {
                let [d, h, h0, dx, u, w, f1, f2, s] = here.listaWymiarow;
                for (let i of [d, h, dx, f1, f2, s]) {
                    if (i === 0) {
                        report(`Parametry "d", "h", "dx", "f (zgr)" "f (wyk)" oraz prędkość nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (d / 2 < h) {
                    report(`Parametr h nie może być większy od połowy średnicy. Proszę zastosować toczenie. `);
                    toRemove = 1;
                }
            }
                break;
            case `fazowanie wewnętrzne`: {
                let [d, h, h0, dx, u, w, f1, f2, s] = here.listaWymiarow;
                for (let i of [d, h, dx, f1, f2, s]) {
                    if (i === 0) {
                        report(`Parametry "d", "h", "dx", "f (zgr)", "f (wyk)" oraz prędkość nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
            }
                break;
            case `rowek wzdłużny`: {
                let [d0, d, h0, h, r, p, q, f, s] = here.listaWymiarow;
                for (let i of [d0, h, r, p, q, f, s]) {
                    if (i === 0) {
                        report(`Parametry "d0", "h", "r", "p", "q", "f" oraz prędkość nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (d0 < d || d === d0) {
                    report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                    toRemove = 1;
                }
                if (p > (d0 - d) / 2) {
                    report(`Za duża głębokość zanurzenia. `);
                    toRemove = 1;
                }
                if (q > h) {
                    report(`Za duża szerokość płytki. `);
                    toRemove = 1;
                }
                if (s >= przygotowka.listaWymiarow[2]) {
                    report(`Wpisana prędkość obrotowa przekracza maksymalną. `);
                    toRemove = 1;
                }
            }
                break;
            case `rowek czołowy`: {
                let [d0, d, h0, h, r, q, p, f, s] = here.listaWymiarow;
                for (let i of [d0, h, r, p, q, f, s]) {
                    if (i === 0) {
                        report(`Parametry "d0", "h", "r", "q", "p", "f" oraz prędkość nie mogą być równe 0. `);
                        toRemove = 1;
                    }
                }
                if (d0 < d || d === d0) {
                    report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                    toRemove = 1;
                }
                if (p > (d0 - d) / 2) {
                    report(`Za duża szerokość płytki. `);
                    toRemove = 1;
                }
                if (q > h) {
                    report(`Za duża głębokość zanurzenia. `);
                    toRemove = 1;
                }
                if (s >= przygotowka.listaWymiarow[2]) {
                    report(`Wpisana prędkość obrotowa przekracza maksymalną. `);
                    toRemove = 1;
                }
            }
                break;
        }
    },
    generateCodeFromScratch: function () { // dont forget to call drawModel after!

        let [srednica, dlugosc] = przygotowka.listaWymiarow;
        openjscadModelParts1 = [];
        openjscadModelParts1.push(`cylinder({r: ${srednica / 2}, h: ${dlugosc}})`);
        openjscadOrigin = `drawOrigin([[${srednica / 2}, 0, 0], [0, ${srednica / 2}, 0], [0, 0, 0]]).rotateX(180), `;
        openjscadCentering = `.rotateX(-90).translate([0, ${-dlugosc / 2}, 0])`;

        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            if (przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
                switch (i.nazwa) {
                    case `toczenie`: {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        openjscadModelParts2 = [
                            `difference(`,
                            `cylinder({r: ${d0 / 2}, h: ${h}})`,
                            `, `,
                            `cylinder({r: ${d / 2}, h: ${h}})`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        if (d === '0') {
                            openjscadModelParts2[2] = ``;
                            openjscadModelParts2[3] = ``;
                        }
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    case `otwór`: {
                        let [h0, h, d] = i.listaWymiarow;
                        openjscadModelParts2 = [
                            `union(`,
                            `cylinder({r: ${d / 2}, h: ${h}}), `,
                            `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 4 * Math.tan(30 * Math.PI / 180)}}).translate([0, 0, ${h}])`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    case `fazowanie zewnętrzne`: {
                        let [d, h, h0] = i.listaWymiarow;
                        openjscadModelParts2 = [
                            `difference(`,
                            `cylinder({r: ${d / 2}, h: ${h}}), `,
                            `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 2}}).rotateX(180).translate([0, 0, ${h}])`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    case `fazowanie wewnętrzne`: {
                        let [d, h, h0] = i.listaWymiarow;
                        openjscadModelParts2 = [
                            `difference(`,
                            `intersection(`,
                            `cylinder({r: ${d / 2 + h}, h: ${h}}), `,
                            `cylinder({r1: ${d / 2 + h}, r2: 0, h: ${d / 2 + h}})`,
                            `), cylinder({r: ${d / 2}, h: ${h}})`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    case `rowek wzdłużny`: {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        openjscadModelParts2 = [
                            `difference(`,
                            `cylinder({r: ${d0 / 2}, h: ${h}}), `,
                            `cylinder({r: ${d / 2}, h: ${h}})`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    case `rowek czołowy`: {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        openjscadModelParts2 = [
                            `difference(`,
                            `cylinder({r: ${d0 / 2}, h: ${h}}), `,
                            `cylinder({r: ${d / 2}, h: ${h}})`,
                            `).translate([0, 0, ${h0}])`
                        ];
                        openjscadModelParts1.push(openjscadModelParts2.join(``));
                        openjscadModelParts2 = [];
                    }
                        break;
                    default:
                        report(`Obróbkę nie rozpoznano: ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. "${i.nazwa}". `);
                        break;
                }
            }
        }

        openjscadModel = openjscadModelParts1.join(`, `);
        openjscadCodeParts[1] = openjscadOrigin;
        openjscadCodeParts[3] = openjscadModel;
        openjscadCodeParts[5] = openjscadCentering;
        openjscadCode = openjscadCodeParts.join(``);
    },
    highlight: function (target) {

        let [srednica, dlugosc] = przygotowka.listaWymiarow;
        openjscadModelParts1 = [];

        switch (target.nazwa) {
            case `toczenie`: {
                let [d0, d, h0, h] = target.listaWymiarow;
                openjscadModelParts2 = [
                    `difference(`,
                    `cylinder({r: ${d0 / 2}, h: ${h}})`,
                    `, `,
                    `cylinder({r: ${d / 2}, h: ${h}})`,
                    `).translate([0, 0, ${h0}])`
                ];
                if (d === '0') {
                    openjscadModelParts2[2] = ``;
                    openjscadModelParts2[3] = ``;
                }
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            case `otwór`: {
                let [h0, h, d] = target.listaWymiarow;
                openjscadModelParts2 = [
                    `union(`,
                    `cylinder({r: ${d / 2}, h: ${h}}), `,
                    `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 4 * Math.tan(30 * Math.PI / 180)}}).translate([0, 0, ${h}])`,
                    `).translate([0, 0, ${h0}])`
                ];
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            case `fazowanie zewnętrzne`: {
                let [d, h, h0] = target.listaWymiarow;
                openjscadModelParts2 = [
                    `difference(`,
                    `cylinder({r: ${d / 2}, h: ${h}}), `,
                    `cylinder({r1: ${d / 2}, r2: 0, h: ${d / 2}}).rotateX(180).translate([0, 0, ${h}])`,
                    `).translate([0, 0, ${h0}])`
                ];
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            case `fazowanie wewnętrzne`: {
                let [d, h, h0] = target.listaWymiarow;
                openjscadModelParts2 = [
                    `difference(`,
                    `intersection(`,
                    `cylinder({r: ${d / 2 + h}, h: ${h}}), `,
                    `cylinder({r1: ${d / 2 + h}, r2: 0, h: ${d / 2 + h}})`,
                    `), cylinder({r: ${d / 2}, h: ${h}})`,
                    `).translate([0, 0, ${h0}])`
                ];
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            case `rowek wzdłużny`: {
                let [d0, d, h0, h] = target.listaWymiarow;
                openjscadModelParts2 = [
                    `difference(`,
                    `cylinder({r: ${d0 / 2}, h: ${h}}), `,
                    `cylinder({r: ${d / 2}, h: ${h}})`,
                    `).translate([0, 0, ${h0}])`
                ];
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            case `rowek czołowy`: {
                let [d0, d, h0, h] = target.listaWymiarow;
                openjscadModelParts2 = [
                    `difference(`,
                    `cylinder({r: ${d0 / 2}, h: ${h}}), `,
                    `cylinder({r: ${d / 2}, h: ${h}})`,
                    `).translate([0, 0, ${h0}])`
                ];
                openjscadModelParts1.push(openjscadModelParts2.join(``));
                openjscadModelParts2 = [];
            }
                break;
            default:
                report(`Obróbkę nie rozpoznano: ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. "${i.nazwa}". `);
                break;
        }

        openjscadModel = openjscadModelParts1.join(`, `);
        openjscadCodeParts[3] = openjscadModel;
        openjscadCode = openjscadCodeParts.join(``);
    },
    generateGCode: function () {

        gCodeMainParts1 = [];
        gCodeMainParts1.push(`
                                                                    (G94/G95 - okreslenie trybu programowania posuwu [mm/min]/[mm/obr])
                                                                    G90
                                                                    G28 U0 W0 (dojazd w pozycje zmiany narzedzia)
                                                                    G50 S${przygotowka.listaWymiarow[2]} M3`);

        NQ = 0; // resets countN();

        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            if (przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
                switch (i.nazwa) {
                    case `toczenie`: {
                        let [d0, d, h0, h, dx, u, w, f1, f2, s] = i.listaWymiarow;
                        countN();
                        let intro = `
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - toczenie)
                            (Txxxx M6)
                            G96 S${s}
                            `;
                        let elementsStrings = [
                            `G00 X`, ` Z`, `
                            G71 U`, ` R1
                            G71 P`, ` Q`, ` U`, ` W`, ` F`, `
                            N`, ` G01 X`, `
                            Z`, `
                            N`, ` X`, `
                            G70 P`, ` Q`, ` F`
                        ];
                        let elementsValues = [
                            d0, -h0 + 1,
                            dx / 2,
                            NP, NQ, u, w, f1,
                            NP, d,
                            h0 + h,
                            NQ, d0,
                            NP, NQ, f2
                        ];
                        let elementsTotal = elementsStrings.map((e, i) => {
                            return e + elementsValues[i];
                        });
                        if (u === 0 && w === 0) {
                            elementsTotal.splice(13, 3);
                        }
                        let completeString = (intro + elementsTotal.join(``)).replaceAll(/ {2}/ig, '');
                        gCodeMainParts1.push(completeString);
                    }
                        break;
                    case `otwór`: {
                        let [h0, h, d, r, q, f, s] = i.listaWymiarow;
                        let intro = `
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - otwor)
                            (Txxxx M6 - wybor wiertla o srednicy ${d} mm i wymiana)
                            G97 S${s}
                            `;
                        let elementsStrings = [
                            `G00 X0 Z`, `
                            G74 R`, `
                            G74 Z`, ` Q`, ` F`
                        ];
                        let elementsValues = [
                            -h0 + 1,
                            r,
                            h + 1, q, f
                        ];
                        let elementsTotal = elementsStrings.map((e, i) => {
                            return e + elementsValues[i]
                        });
                        let completeString = (intro + elementsTotal.join(``)).replaceAll(/ {2}/ig, '');
                        gCodeMainParts1.push(completeString);
                    }
                        break;
                    case `fazowanie zewnętrzne`: {
                        let [d, h, h0, dx, u, w, f1, f2, s] = i.listaWymiarow;
                        countN();
                        let intro = `
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - fazowanie zewnetrzne)
                            (Txxxx M6)
                            G96 S${s}
                            `;
                        let elementsStrings = [
                            `G00 X`, ` Z`, `
                            G71 U`, ` R1
                            G71 P`, ` Q`, ` U`, ` W`, ` F`, `
                            N`, ` G01 X`, `
                            Z`, `
                            N`, ` X`, ` Z`, `
                            G70 P`, ` Q`, ` F`
                        ];
                        let elementsValues = [
                            d, -h0 + 1,
                            dx / 2,
                            NP, NQ, u, w, f1,
                            NP, d - 2 * h,
                            1,
                            NQ, d, h,
                            NP, NQ, f2
                        ];
                        let elementsTotal = elementsStrings.map((e, i) => {
                            return e + elementsValues[i]
                        });
                        if (u === 0 && w === 0) {
                            elementsTotal.splice(14, 3);
                        }
                        let completeString = (intro + elementsTotal.join(``)).replaceAll(/ {2}/ig, '');
                        gCodeMainParts1.push(completeString);
                    }
                        break;
                    case `fazowanie wewnętrzne`: {
                        let [d, h, h0, dx, u, w, f1, f2, s] = i.listaWymiarow;
                        countN();
                        let intro = `
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - fazowanie wewnetrzne)
                            (Txxxx M6)
                            G96 S${s}
                            `;
                        let elementsStrings = [
                            `G00 X`, ` Z`, `
                            G71 U`, ` R1
                            G71 P`, ` Q`, ` U`, ` W`, ` F`, `
                            N`, ` G01 X`, `
                            Z`, `
                            N`, ` X`, ` Z`, `
                            G70 P`, ` Q`, ` F`
                        ];
                        let elementsValues = [
                            d, -h0 + 1,
                            dx / 2,
                            NP, NQ, -u, w, f1,
                            NP, d + 2 * h,
                            1,
                            NQ, d, h,
                            NP, NQ, f2
                        ];
                        let elementsTotal = elementsStrings.map((e, i) => {
                            return e + elementsValues[i]
                        });
                        if (u === 0 && w === 0) {
                            elementsTotal.splice(14, 3);
                        }
                        let completeString = (intro + elementsTotal.join(``)).replaceAll(/ {2}/ig, '');
                        gCodeMainParts1.push(completeString);
                    }
                        break;
                    case `rowek wzdłużny`: {
                        let [d0, d, h0, h, r, p, q, f, s] = i.listaWymiarow;
                        let intro = `
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek wzdluzny)
                            (Txxxx M6 - wybor wytaczaka o szerokosci plytki ${q / 1000} mm i wymiana)
                            G97 S${s}
                            `;
                        let elementsStrings = [
                            `G00 X`, ` Z`, `
                            G75 R`, `
                            G75 X`, ` Z`, ` P`, ` Q`, ` F`
                        ];
                        let elementsValues = [
                            d0 + 2, -(h0 + h),
                            r,
                            d, -(h0 + q), p, q, f
                        ];
                        let elementsTotal = elementsStrings.map((e, i) => {
                            return e + elementsValues[i]
                        });
                        let completeString = (intro + elementsTotal.join(``)).replaceAll(/ {2}/ig, '');
                        gCodeMainParts1.push(completeString);
                    }
                        break;
                    case `rowek czołowy`: {
                        let [d0, d, h0, h, r, q, p, f, s] = i.listaWymiarow;
                        let intro = `
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek czolowy)
                            (Txxxx M6 - wybor wytaczaka o szerokosci plytki ${p / 1000} mm i wymiana)
                            G97 S${s}
                            `;
                        let elementsStrings = [
                            `G00 X`, ` Z`, `
                            G74 R`, `
                            G74 X`, ` Z`, ` Q`, ` P`, ` F`
                        ];
                        let elementsValues = [
                            d0, -h0 + 1,
                            r,
                            d + p, h, q, p, f
                        ];
                        let elementsTotal = elementsStrings.map((e, i) => {
                            return e + elementsValues[i]
                        });
                        let completeString = (intro + elementsTotal.join(``)).replaceAll(/ {2}/ig, '');
                        gCodeMainParts1.push(completeString);
                    }
                        break;
                }
            } else {
                switch (i.nazwa) {
                    case `toczenie`:
                        gCodeMainParts2.push(`
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - toczenie - wykluczono)`);
                        break;
                    case `otwór`:
                        gCodeMainParts2.push(`
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - otwor - wykluczono)`);
                        break;
                    case `fazowanie zewnętrzne`:
                        gCodeMainParts2.push(`
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - fazowanie zewnetrzne - wykluczono)`);
                        break;
                    case `fazowanie wewnętrzne`:
                        gCodeMainParts2.push(`
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - fazowanie wewnetrzne - wykluczono)`);
                        break;
                    case `rowek wzdłużny`:
                        gCodeMainParts2.push(`
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek wzdluzny - wykluczono)`);
                        break;
                    case `rowek czołowy`:
                        gCodeMainParts2.push(`
                            (obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek czolowy - wykluczono)`);
                        break;
                }
            }

            gCodeMainParts1.push(`
                                                                    G28 U0 W0 (dojazd w pozycje zmiany narzedzia)`);
        }
        gCodeMainParts1.push(`
                                                                    M30`);

        gCodeMain = gCodeMainParts1.join(`
        `);
        gCodeParts[1] = gCodeMain;
        gCode = gCodeParts.join(`
        `).replaceAll(/ {2}/ig, '').replaceAll('\n\n', '\n').trim();
    }
};

let action = {}; // depending on "przygotowka", one of objects with main methods is stored here (at "setFunctions()")

function setFunctions() {
    switch (przygotowka.nazwa) {
        case `kostka`:
            action = {...actionsKostka};
            report(`Ustawiono funkcje dla kostki. `);
            break;
        case `walec`:
            action = {...actionsWalec};
            //opisy = walecOpisy;
            report(`Ustawiono funkcje dla walca. `);
            break;
        default:
            report(`Nie ustalono przygotówki. `);
            break;
    }
    /* opisy
    nazwy = [przygotowka.nazwa];
    for (let i of przygotowka.dostepneObrobki) {
        nazwy.push(i.nazwa);
    }
    */
}

function drawModel() {
    processor.setJsCad(openjscadCode); // might want to make figure transparent
}

function calculateRemainder(a, b) {
    return (a * 1000) % (b * 1000) / 1000;
}

let NP, NQ = 0;

function countN() {
    NP = NQ + 10;
    NQ = NP + 10;
}


// DOM manipulations: (works as is, much good, NO TOUCH! Held functions should be there)
function loadList(loadOf, nextStep) {

    // for "wstecz"
    clearHTML(elements.inputsList); // this line is useful only after "wstecz"
    clearHTML(elements.upperField);
    elements.upperField.appendChild(elements.choicesList); // "choicesList" was there already before clearing at previous line, but this should be done to enable "wstecz"

    clearHTML(elements.choicesList);
    for (let i of loadOf) {
        modifyHTML(elements.choicesList, `<li>${i.nazwa}</li>`);
    }
    for (let e of elements.choices) {
        e.addEventListener('click', nextStep);
    }

    // style
    for (let e of elements.choices) {
        e.addEventListener('mouseenter', (event) => {
            event.target.style.color = 'orange';
        });
        e.addEventListener('mouseleave', (event) => {
            event.target.style.color = '';
        });
    }
}

function loadInput(clicked, loadOf, nextStep, previousStep) {

    let option = {};

    // determining what option has been chosen, is stored to "option"
    for (let i of loadOf) {
        if (i.nazwa === clicked.innerHTML) {
            option = JSON.parse(JSON.stringify(i));
        }
    }

    // "rightList" and "dataInput" text, input fields
    /*
    for (let i = 0; i < nazwy.length; i++) {
        if (option.nazwa === nazwy[i]) {
            console.log(nazwy[i]);
            console.log(opisy);
            console.log(opisy[i]);
            elements.upperField.innerHTML = opisy[i];
        }
    }*/
    elements.upperField.innerHTML = `${option.opis}`;
    clearHTML(elements.inputsList);
    for (let i of option.nazwyWymiarow) {
        modifyHTML(elements.inputsList, `
            <li>${i}<br>
            <input type="text"></li>
        `);
    }

    // buttons
    modifyHTML(elements.inputsList, `<div class="header-1 d-md-flex justify-content-md-evenly"><button class="btn btn-outline-dark btn-sm" id="wstecz">Wstecz</button><button class="btn btn-outline-dark btn-sm" id="getInput">Zapisz</button></div>`);
    elements.wstecz = document.getElementById('wstecz');
    elements.getInput = document.getElementById('getInput');
    elements.wstecz.addEventListener('click', previousStep);
    elements.getInput.addEventListener('click', nextStep);

    return option;
}

function processInput(loadTo) {

    for (let i = 0; i < elements.inputs.length; i++) {

        let val = null;

        // sets "val", turns comma to point, negative to positive
        if (elements.inputs[i].value.includes(`,`)) {
            val = parseFloat(elements.inputs[i].value.toString().replaceAll(/,/g, `.`));
        } else {
            val = parseFloat(elements.inputs[i].value);
        }
        if (val < 0) {
            val *= -1;
        }

        // checks if input ("val") is a number, if not - prevents the creation of "obrobka"
        if (isNaN(val)) {
            report(`Wymiary muszą być w postaci liczb. `);
            toRemove = 1;
            return;
        }

        // stores input where it belongs
        loadTo.listaWymiarow[i] = val;
    }

    // checks if input is suiting for specific chosen "obrobka", if not - sends a signal ("toRemove"), which will be processed later and this "obrobka" will be removed
    action.checkValues(loadTo);

    // checks if this "obrobka" already exists (any small change in input (stored) values is enough to pass through this), if it does - "toRemove"
    // if no "toRemove" is triggered - .push "obrobka" to a place in "przygotowka", together with an active flag. "obrobka" cleared
    if (loadTo === obrobka) {

        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            if (i.nazwa === obrobka.nazwa) {
                if (i.listaWymiarow.every((val, num) => val === obrobka.listaWymiarow[num])) {
                    report(`Ta obróbka już istnieje. `);
                    toRemove = 1;
                }
            }
        }

        if (toRemove === 0) {
            przygotowka.kartaObrobki.listaObrobek.push(loadTo);
            przygotowka.kartaObrobki.aktywne.push(true);
        }

        obrobka = {};
    }

    // clears sections, brings "choicesList" back
    clearHTML(elements.inputsList);
    clearHTML(elements.upperField);
    elements.upperField.appendChild(elements.choicesList); // only a template, will be filled later
}

function proceed(obj) {

    if (obj === przygotowka) {
        setFunctions();
    }

    processInput(obj); // checks for suitable input, stores input in object, clears lower section, rewrites upper section with choices already with listeners. In case of "obrobka", stores it in "przygotowka"
    if (toRemove === 1) {
        toRemove = 0;
        return;
    }

    uploadHistory();
    action.generateCodeFromScratch(); // rewrites code each time. Not much work because figure is redrawn anyways
    drawModel();

    if (obj === przygotowka) {
        etapObrobki();
    }
}

function report(msg) {
    elements.console_log.innerHTML = `<span class="message d-md-flex justify-content-md-center">${msg} <span class="date-label">[${dateTimeFormat(2)}]</span></span>`;
}

function report2(msg) {
    elements.console_log_2.innerHTML = `<span class="message d-md-flex justify-content-md-center">${msg}</span>`;
}

function uploadHistory() {

    clearHTML(elements.history);
    modifyHTML(elements.history, `<li>${przygotowka.nazwa}</li>`);

    for (let i of przygotowka.kartaObrobki.listaObrobek) {
        if (przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
            if (przygotowka.kartaObrobki.listaObrobek[przygotowka.kartaObrobki.listaObrobek.indexOf(i)].nazwa === 'czoło') {
                modifyHTML(elements.history, `<li style>${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. ${i.nazwa} (${i.listaWymiarow[0]})</li>`);
            } else {
                modifyHTML(elements.history, `<li style>${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. ${i.nazwa}</li>`);
            }
        }
        if (!przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
            if (przygotowka.kartaObrobki.listaObrobek[przygotowka.kartaObrobki.listaObrobek.indexOf(i)].nazwa === 'czoło') {
                modifyHTML(elements.history, `<li style="text-decoration: line-through">${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. ${i.nazwa} (${i.listaWymiarow[0]})</li>`);
            } else {
                modifyHTML(elements.history, `<li style="text-decoration: line-through">${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1}. ${i.nazwa}</li>`);
            }
        }
    }

    for (let e of elements.points) {
        e.addEventListener('click', catchFromHistoryClick);
        e.addEventListener('mouseenter', catchFromHistoryEnter);
        e.addEventListener('mouseleave', catchFromHistoryLeave);

        // style
        e.addEventListener('mouseenter', (event) => {
            event.target.style.color = 'orange';
        });
        e.addEventListener('mouseleave', (event) => {
            event.target.style.color = '';
        });
    }
}

let target = null;
let index = ``;

function catchFromHistoryClick() {

    if (this.innerHTML === przygotowka.nazwa) {
        return;
    }

    // switches active flag
    przygotowka.kartaObrobki.aktywne[index] = !przygotowka.kartaObrobki.aktywne[index];

    action.generateCodeFromScratch();
    drawModel();
    uploadHistory();
}

function catchFromHistoryEnter() {

    if (this.innerHTML === przygotowka.nazwa) {
        return;
    }

    // gets full index, not only one digit
    for (let i = 0; i < this.innerHTML.toString().indexOf(`.`); i++) {
        index += this.innerHTML.toString()[i];
    }
    index = parseFloat(index) - 1;

    target = przygotowka.kartaObrobki.listaObrobek[index];

    action.highlight(target);
    drawModel();
}

function catchFromHistoryLeave() {

    if (this.innerHTML === przygotowka.nazwa) {
        return;
    }

    action.generateCodeFromScratch();
    drawModel();

    index = ``;
    target = null;
}


// Main line:
function etapPrzygotowki() {

    if (Object.keys(przygotowka).length !== 0) {
        exportObject();
    }

    step1();

    function step1() {
        loadList(dostepnePrzygotowki, step2); // clears upper section, adds names, adds listeners
        report2(`Wybierz przygotówkę. `);
    }

    function step2() {
        przygotowka = loadInput(this, dostepnePrzygotowki, step3, step1); // picks object by clicked item, rewrites upper section with "opis", clears lower section, adds names, input fields and buttons, adds listener
        report2(`Wpisz wymiary. `);
    }

    function step3() {
        proceed(przygotowka);
    }
}

function etapObrobki() {

    step1();

    function step1() {
        loadList(przygotowka.kartaObrobki.dostepneObrobki, step2);
        report2(`Wybierz obróbkę. `);
    }

    function step2() {
        obrobka = loadInput(this, przygotowka.kartaObrobki.dostepneObrobki, step3, step1);
        report2(`Wpisz wymiary. `);
    }

    function step3() {
        proceed(obrobka);
        report2(`Wybierz obróbkę. `);
    }
}


// Export and import:
function exportObject() {

    if (Object.keys(przygotowka).length === 0 || przygotowka.listaWymiarow[0] === undefined) {
        report(`Próba eksportować model. Model pusty. `);
        return;
    }

    let a = document.createElement('a');
    a.href = "data:application/octet-stream," + encodeURIComponent(JSON.stringify(przygotowka));
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
            openjscadCode = ``;
            drawModel();
            return;
        }

        report(`Przygotówkę załadowano. `);

        uploadHistory();
        setFunctions();
        action.generateCodeFromScratch();
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
        przygotowka = JSON.parse(content);
    }).catch(() => {
        report(`Błąd odczytu pliku. `);
    });
}

function readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    })
}


// Activation:
function bindListeners() {
    elements.btnStart.addEventListener('click', etapPrzygotowki);
    elements.btnGenerateGCode.addEventListener('click', function () {
        if (Object.keys(przygotowka).length === 0 || przygotowka.listaWymiarow[0] === undefined || przygotowka.kartaObrobki.listaObrobek[0] === undefined || przygotowka.kartaObrobki.listaObrobek[0].listaWymiarow[0] === undefined) {
            report(`Próba wygenerować kod obróbki. Model pusty. `);
            return;
        }

        action.generateGCode();
        let a = document.createElement('a');
        a.href = "data:application/octet-stream," + encodeURIComponent(gCode);
        a.download = `g-code ${przygotowka.nazwa} (${dateTimeFormat(1)}).txt`;
        a.click();

        let doPorownania = ``;
        doPorownania += `
${przygotowka.nazwa}: `;
        for (let i = 0; i < przygotowka.nazwyWymiarow.length; i++) {
            doPorownania += `
    ${przygotowka.nazwyWymiarow[i]}: ${przygotowka.listaWymiarow[i]}`;
        }
        for (let i = 0; i < przygotowka.kartaObrobki.listaObrobek.length; i++) {
            if (przygotowka.kartaObrobki.aktywne[i]) {
                doPorownania += `
${i + 1}. ${przygotowka.kartaObrobki.listaObrobek[i].nazwa}: `;
                for (let j of przygotowka.kartaObrobki.listaObrobek[i].nazwyWymiarow) {
                    doPorownania += `
    ${j}: ${przygotowka.kartaObrobki.listaObrobek[i].listaWymiarow[przygotowka.kartaObrobki.listaObrobek[i].nazwyWymiarow.indexOf(j)]}`;
                }
            }
        }
        doPorownania = doPorownania.replaceAll('\n\n', '\n').trim();
        let b = document.createElement('a');
        b.href = "data:application/octet-stream," + encodeURIComponent(doPorownania);
        b.download = `opis obrobki ${przygotowka.nazwa} (${dateTimeFormat(1)}).txt`;
        b.click();
    });
    elements.btnExport.addEventListener('click', exportObject);
    elements.inputFile.addEventListener('change', importObject);
    elements.btnHelp.addEventListener('click', showHelp);
    //elements.btnHelp.addEventListener('click', fastForwardGCode);
}

function showHelp() {
    // adding a guide
    elements.page.innerHTML = helperPage;
    // listening to button click to load the page
    document.getElementById(`close-help-page`).addEventListener(`click`, () => {
        elements.page.innerHTML = ``;
        elements.page.appendChild(elements.mainPage);
        elements.drawingOuter.appendChild(elements.drawing);

    });
}

bindListeners();
/*
function fastForwardGCode() {
    let comparison = [];
    let c = document.createElement('a');
    function fill(_element, _values) {
        for (let i of _values) {
            _element.listaWymiarow.push(i);
        }
    }
    function create(_element, _values) {
        if (typeof(_element) === "object") {
            if (_element.nazwa === 'kostka' || 'walec') {
                fill(_element, _values);
                przygotowka = _element;
                setFunctions();
                return;
            } else {
                report(`wrong`);
            }
        }
        let target = przygotowka.kartaObrobki.dostepneObrobki[_element];
        fill(target, _values);
        przygotowka.kartaObrobki.listaObrobek.push(target);
        przygotowka.kartaObrobki.aktywne.push(true);

        action.checkValues(target);
        if (toRemove === 1) {
            przygotowka.kartaObrobki.listaObrobek.splice(0, 1);
            przygotowka.kartaObrobki.aktywne.splice(0, 1);
            return;
        }

        action.generateGCode();
        comparison.push(gCodeMain.replaceAll(/ {2}/ig, '').replaceAll('\n\n', '\n').trim());

        przygotowka.kartaObrobki.listaObrobek.splice(0, 1);
        przygotowka.kartaObrobki.aktywne.splice(0, 1);
    }
    // __________________________________________________________
    // use create(_element, _values), accepts INDEX OF OBROBKA or PRZYGOTOWKA OBJECT as _element

    //['x0', 'y0', 'R', 'l', 'h', 'średnica narzędzia', 'grubość przejścia w Z', `f`]
    //create(kostka, [40, 40, 10, 100]);
    //create(4, [20, 20, 10, 5, 3, 4, 2, 1]);

    // __________________________________________________________
    for (let i of comparison) {
        c.href = "data:application/octet-stream," + encodeURIComponent(i);
        c.download = `g-code ${comparison.indexOf(i) + 1}.txt`;
        c.click();
    }
}
*/
