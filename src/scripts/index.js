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
const originFunction = require('../models/origin-function'); // is an OpenJSCAD code for origin figure (colored arrows)
const m3 = require('../models/m-3');



// Main object storing:
let obrobka = {}; // changes completely each time a new obrobka is added, stores obrobka and is pushed to listaObrobek array in przygotowka object
let przygotowka = {}; // this is the main object, here obrobka is stored; it is used to draw figure, should be exported to save, might also want to import right here too. Nothing changes while program is running, only obrobka objects added in the array.
const dostepnePrzygotowki = [kostka, walec];
// let listaPrzygotowek = []; for storing different imported przygotowka objects at the same time (function store)
let toRemove = 0; // acquires 1 when current obrobka is going to be removed



// OpenJSCAD and G-code manipulations:
                let openjscadModelParts2 = []; // one filled each time a new part is generated, pushed joined to openjscadModelParts1 and cleared. Should be filled with commas manually!
            let openjscadModelParts1 = []; // here code for figures is stored (one element for one figure including translations)
        let openjscadModel = ``; // = openjscadModelParts1.join(', ') here code for figures is united
        let openjscadOrigin = ``;
        let openjscadCentering = ``;
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
`, originFunction]; // here code for figures is stored with the functional code
let openjscadCode = ``; // = openjscadCodeParts.join(``) here all code is united, final entity

                let gCodeMainParts2 = [];
            let gCodeMainParts1 = [];
        let gCodeMain = ``;
        let gCodeCommentSign = `;`;
    let gCodeParts = [`
                                                                    ${gCodeCommentSign} Kod wygenerowano automatycznie w aplikacji, stanowiacej podstawe pracy dyplomowej.
                                                                    ${gCodeCommentSign}`,
                                                                    gCodeMain
    ];
let gCode = ``;
let doPorownania = ``;

let offset1 = 0;

const functionsKostka = {
    checkValues: function (here) {
        switch (here.nazwa) {
            case `kostka`:
                for (let i of here.listaWymiarow) {
                    if (i === `0`) {
                        report(`Wymiary nie mogą być równe 0. `);
                        przygotowka = {};
                        etapPrzygotowki();
                        toRemove = 1;
                    }
                }
                break;
            case `czoło`: {
                let [h] = here.listaWymiarow;
                if (h === '0') {
                    report(`Parametr h nie może być równy 0. `);
                    toRemove = 1;
                }
                if (h > przygotowka.listaWymiarow[2]) {
                    report(`Parametr h nie może być większy niż wysokość kostki. `);
                    toRemove = 1;
                }
                if (h === offset1) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
            }
                break;
            case `otwór`: {
                let [x, y, d, h] = here.listaWymiarow;
                if (d === '0' || h === '0') {
                    report(`Parametry d i h nie mogą być równa 0. `);
                    toRemove = 1;
                }
                if (h === offset1) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
            }
                break;
            case `kieszeń prostokątna`: {
                let [x0, y0, x, y, h, r] = here.listaWymiarow;
                if (y - 2 * r < 0 || x - 2 * r < 0) {
                    report(`Za duży promień zaokrąglenia. Obróbka nie została wykonana. `);
                    toRemove = 1; // does nothing if importing an object (which is bad), THOUGH - cannot export objects that pass in this section
                }
                if (x === '0' || y === '0' || h === '0' || r === '0') {
                    report(`Parametry x, y, h i r nie mogą być równe 0. `);
                    toRemove = 1;
                }
                if (h === offset1) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
            }
                break;
            case `kieszeń okrągła`: {
                let [x0, y0, r, h] = here.listaWymiarow;
                if (r === '0' || h === '0') {
                    report(`Parametry r i h nie mogą być równe 0. `);
                    toRemove = 1;
                }
                if (h === offset1) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
            }
                break;
            case `rowek kołowy`: {
                let [x0, y0, R, l, h] = here.listaWymiarow;
                if (R - l / 2 < 0) { // R < l / 2
                    report(`Rowek kołowy: promień ścieżki mniejszy od połowy jej szerokości, wykonanie niemożliwe ze względów geometrycznych. Obróbka nie została wykonana. `);
                    toRemove = 1;
                }
                if (R - l / 2 === 0) {
                    report(`R = 0.5l - wynikiem będzie kieszeń okrągła. Obróbka nie została wykonana. Proszę wybrać odpowiednią opcję. `);
                    toRemove = 1;
                }
                if (R === '0' || l === '0' || h === '0') {
                    report(`Parametry R, l i h nie mogą być równe 0. `);
                    toRemove = 1;
                }
                if (h === offset1) {
                    report(`Należy uwzględnić poprzednie obróbki czoła. `);
                    toRemove = 1;
                }
            }
                break;
            default:
                report(`functionsKostka -> checkValues -> switch default (${here.nazwa})`);
                break;
        }
    },
    generateCodeFromScratch: function () { // dont forget to call drawModel after!

        let [szerokosc, dlugosc, wysokosc] = przygotowka.listaWymiarow;
        openjscadModelParts1 = [];
        openjscadModelParts1.push(`cube({size: [${szerokosc}, ${dlugosc}, ${wysokosc}]}).translate([0, 0, ${-wysokosc}])`);
        openjscadOrigin = `drawOrigin([[${szerokosc}, 0, 0], [0, ${dlugosc}, 0], [0, 0, 0]]), `;
        openjscadCentering = `.translate([${-szerokosc / 2}, ${-dlugosc / 2}, 0])`;

        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            if (przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
                offset1 = 0;
                switch (i.nazwa) {
                    case `czoło`: {
                        let [h] = i.listaWymiarow;
                        openjscadModelParts1.push(`cube({size: [${szerokosc}, ${dlugosc}, ${h}]}).translate([0, 0, ${-h}])`);
                        offset1 += h;
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

        let [szerokoscKostki, dlugoscKostki, wysokoscKostki] = przygotowka.listaWymiarow;
        gCodeMainParts1 = [];
        gCodeMainParts1.push(`
                                                                    ${gCodeCommentSign} G94/G95 - okreslenie trybu programowania posuwu. Posuwy nalezy wpisac recznie
                                                                    G90
                                                                    G00 X100 Y100 Z100 ${gCodeCommentSign} dojazd w pozycje zmiany narzedzia`);

        let offset2 = 0;

        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            if (przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
                switch (i.nazwa) {
                    case `czoło`: {
                        let [gruboscWarstwy, srednicaNarzedzia, gruboscPrzejscia] = i.listaWymiarow;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - czolo
                                                                    ${gCodeCommentSign} Txxxx - wybor narzedzia o srednicy ${srednicaNarzedzia} mm
                                                                    G00 X-${srednicaNarzedzia / 2} Y${srednicaNarzedzia / 2}
                                                                    Z1
                                                                    G91`);

                        let iloscPrzejsc1 = gruboscWarstwy / gruboscPrzejscia;
                        let iloscPrzejsc2 = dlugoscKostki / srednicaNarzedzia;
                        let znak = 1;


                        for (let i = 0; i < iloscPrzejsc1; i ++) {
                            if (i <= iloscPrzejsc1 - 1) {
                                gCodeMainParts2.push(`
                                                                        G01 Z-${gruboscPrzejscia - offset2}`);
                            } else {
                                gCodeMainParts2.push(`
                                                                        G01 Z-${calculateRemainder(gruboscWarstwy, gruboscPrzejscia)}`);
                            }


                            for (let j = 1; j < iloscPrzejsc2; j++) { // j = 1 because the last line is out of this loop
                                gCodeMainParts2.push(`
                                                                            X${znak * (szerokoscKostki + srednicaNarzedzia)}
                                                                            Y${srednicaNarzedzia}`);
                                znak *= -1;
                            }
                            gCodeMainParts2.push(`
                                                                            X${znak * (szerokoscKostki + srednicaNarzedzia)}`);

                            if (i <= iloscPrzejsc1 - 1) {
                                if (znak === -1) {
                                    gCodeMainParts2.push(`
                                                                            G00 Y-${Math.ceil(iloscPrzejsc2) * srednicaNarzedzia} Z1`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                            G00 X-${szerokoscKostki + srednicaNarzedzia} Y-${Math.ceil(iloscPrzejsc2) * srednicaNarzedzia} Z1`);
                                }
                            } else {
                                gCodeMainParts2.push(`
                                                                        G00 Z1`);
                            }
                        }

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];

                        offset2 += gruboscWarstwy;
                    }
                        break;
                    case `otwór`: {
                        let [x, y, d, h] = i.listaWymiarow;
                        h = h - offset2;
                        let pyptyk = d / 4 * Math.tan(30 * Math.PI / 180);
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - otwor
                                                                    ${gCodeCommentSign} Txxxx - wybor narzedzia o srednicy ${d} mm
                                                                    G00 X${x} Y${y}
                                                                    Z${1 + pyptyk}
                                                                    G91
                                                                    G01 Z-${h + 1 + pyptyk}
                                                                    Z${h + 1 + pyptyk}`); // pyptyk everywhere because G91! (not G90)

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `kieszeń prostokątna`: {
                        let [x0, y0, x, y, h, r, srednicaNarzedzia, gruboscPrzejscia] = i.listaWymiarow;
                        h = h - offset2;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - kieszen prostokatna`);



                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `kieszeń okrągła`: {
                        let [x0, y0, r, h, srednicaNarzedzia, gruboscPrzejscia] = i.listaWymiarow;
                        h = h - offset2;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - kieszen okragla
                                                                    ${gCodeCommentSign} Txxxx - wybor narzedzia o srednicy ${srednicaNarzedzia} mm
                                                                    G00 X${x0} Y${y0}
                                                                    Z1
                                                                    G91`);

                        let iloscPrzejsc1 = h / gruboscPrzejscia;
                        let iloscPrzejsc2 = (2 * r - srednicaNarzedzia) / (2 * srednicaNarzedzia);
                        for (let i = 0; i < iloscPrzejsc1; i++) {
                            if (i <= iloscPrzejsc1 - 1) {
                                gCodeMainParts2.push(`
                                                                        G01 Z-${gruboscPrzejscia + 1}`);
                            } else {
                                gCodeMainParts2.push(`
                                                                        G01 Z-${calculateRemainder(h, gruboscPrzejscia) + 1}`);
                            }

                            for (let j = 0; j < iloscPrzejsc2; j++) {
                                if (j <= iloscPrzejsc2 - 1) {
                                    gCodeMainParts2.push(`
                                                                            X${srednicaNarzedzia}
                                                                            G02 G17 X0 Y0 I-${(srednicaNarzedzia / 2) + (j * srednicaNarzedzia)} J0`);
                                } else {
                                    gCodeMainParts2.push(`
                                                                            X${calculateRemainder(2 * r - srednicaNarzedzia, 2 * srednicaNarzedzia)}
                                                                            G02 G17 X0 Y0 I-${r - (srednicaNarzedzia / 2)} J0`);
                                }
                            }
                            gCodeMainParts2.push(`
                                                                        G00 X-${r - (srednicaNarzedzia / 2)} Z1`);

                        }
                        gCodeMainParts2.push(`
                                                                    Z${h}`);

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `rowek kołowy`: {
                        let [x0, y0, R, l, h, srednicaNarzedzia, gruboscPrzejscia] = i.listaWymiarow;
                        h = h - offset2;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek kolowy`);

                        /*
                         * x0 + R - l / 2 + srednicaNarzedzia / 2 - poczatek = dojazd w x i y (y = y0) -> dojazd na z1 -> g91 -> g01 poglebienie w z -> kolo -> ruch w x+ itd jak w kieszen okragla
                         *
                         *
                         */

                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                }
            } else {
                switch (i.nazwa) {
                    case `czoło`:
                        gCodeMainParts1.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - czolo - (wykluczono)`);
                        break;
                    case `otwór`:
                        gCodeMainParts1.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - otwor - (wykluczono)`);
                        break;
                    case `kieszeń prostokątna`:
                        gCodeMainParts1.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - kieszen prostokatna - (wykluczono)`);
                        break;
                    case `kieszeń okrągła`:
                        gCodeMainParts1.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - kieszen okragla - (wykluczono)`);
                        break;
                    case `rowek kołowy`:
                        gCodeMainParts1.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek kolowy - (wykluczono)`);
                        break;
                }
            }

            gCodeMainParts1.push(`
                                                                    G90
                                                                    G00 X100 Y100 Z100 ${gCodeCommentSign} dojazd w pozycje zmiany narzedzia`);
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

const functionsWalec = {
    checkValues: function (here) {
        switch (here.nazwa) {
            case `walec`:
                for (let i of here.listaWymiarow) {
                    if (i === `0`) {
                        report(`Wymiary nie mogą być równe 0. `);
                        przygotowka = {};
                        etapPrzygotowki();
                        toRemove = 1;
                    }
                }
                break;
            case `toczenie`: {
                let [d0, d, h0, h] = here.listaWymiarow;
                if (d0 < d || d === d0) {
                    report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                    toRemove = 1;
                }
                if (d0 === '0' || h === '0') {
                    report(`Parametry d0 i h nie mogą być równe 0. `);
                    toRemove = 1;
                }
            }
                break;
            case `otwór`: {
                let [h0, h, d] = here.listaWymiarow;
                if (d === '0' || h === '0') {
                    report(`Parametry d i h nie mogą być równe 0. `);
                    toRemove = 1;
                }
            }
                break;
            case `fazowanie zewnętrzne`: {
                let [d, h, h0] = here.listaWymiarow;
                if (d === '0' || h === '0') {
                    report(`Parametry d i h nie mogą być równe 0. `);
                    toRemove = 1;
                }
                if (d / 2 < h) {
                    report(`Parametr h nie może być większy od połowy średnicy. Proszę zastosować toczenie. `);
                    toRemove = 1;
                }
            }
                break;
            case `fazowanie wewnętrzne`: {
                let [d, h, h0] = here.listaWymiarow;
                if (d === '0' || h === '0') {
                    report(`Parametry d i h nie mogą być równe 0. `);
                    toRemove = 1;
                }
            }
                break;
            case `rowek wzdłużny`: {
                let [d0, d, h0, h] = here.listaWymiarow;
                if (d0 === '0' || h === '0') {
                    report(`Parametry d0 i h nie mogą być równe 0. `);
                    toRemove = 1;
                }
                if (d0 < d || d === d0) {
                    report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                    toRemove = 1;
                }
            }
                break;
            case `rowek czołowy`: {
                let [d0, d, h0, h] = here.listaWymiarow;
                if (d0 === '0' || h === '0') {
                    report(`Parametry d0 i h nie mogą być równe 0. `);
                    toRemove = 1;
                }
                if (d0 < d || d === d0) {
                    report(`Średnica końcowa nie może być większa lub równa początkowej. `);
                    toRemove = 1;
                }
            }
                break;
            default:
                report(`functionsWalec -> checkValues -> switch default (${here.nazwa})`);
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

        let [srednicaWalca, dlugoscWalca] = przygotowka.listaWymiarow;
        gCodeMainParts1 = [];
        gCodeMainParts1.push(`
                                                                    ${gCodeCommentSign} G94/G95 - okreslenie trybu programowania posuwu. Posuwy nalezy wpisac recznie
                                                                    G90
                                                                    G00 Z100 X100 ${gCodeCommentSign} dojazd w pozycje zmiany narzedzia`);

        for (let i of przygotowka.kartaObrobki.listaObrobek) {
            if (przygotowka.kartaObrobki.aktywne[przygotowka.kartaObrobki.listaObrobek.indexOf(i)]) {
                switch (i.nazwa) {
                    case `toczenie`: {
                        let [d0, d, h0, h, dx] = i.listaWymiarow;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - toczenie`);



                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `otwór`: {
                        let [d, h] = i.listaWymiarow;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - otwor`);



                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `fazowanie zewnętrzne`: {
                        let [d, h, h0] = i.listaWymiarow;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - fazowanie zewnetrzne`);



                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `fazowanie wewnętrzne`: {
                        let [d, h, h0] = i.listaWymiarow;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - fazowanie wewnetrzne`);



                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `rowek wzdłużny`: {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek wzdluzny`);



                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                    case `rowek czołowy`: {
                        let [d0, d, h0, h] = i.listaWymiarow;
                        gCodeMainParts2.push(`
                                                                    ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek czolowy`);



                        gCodeMainParts1.push(gCodeMainParts2.join(`
                        `));
                        gCodeMainParts2 = [];
                    }
                        break;
                }
            } else {
                switch (i.nazwa) {
                    case `toczenie`:
                        gCodeMainParts2.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - toczenie - (wykluczono)`);
                        break;
                    case `otwór`:
                        gCodeMainParts2.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - otwor - (wykluczono)`);
                        break;
                    case `fazowanie zewnętrzne`:
                        gCodeMainParts2.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - fazowanie zewnetrzne - (wykluczono)`);
                        break;
                    case `fazowanie wewnętrzne`:
                        gCodeMainParts2.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - fazowanie wewnetrzne - (wykluczono)`);
                        break;
                    case `rowek wzdłużny`:
                        gCodeMainParts2.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek wzdluzny - (wykluczono)`);
                        break;
                    case `rowek czołowy`:
                        gCodeMainParts2.push(`
                            ${gCodeCommentSign} obrobka nr. ${przygotowka.kartaObrobki.listaObrobek.indexOf(i) + 1} - rowek czolowy - (wykluczono)`);
                        break;
                }
            }

            gCodeMainParts1.push(`
                                                                    G90
                                                                    G00 Z100 X100 ${gCodeCommentSign} dojazd w pozycje zmiany narzedzia`);
        }
        gCodeMainParts2.push(`
                                                                    M30`);

        gCodeMain = gCodeMainParts1.join(`
        `);
        gCodeParts[1] = gCodeMain;
        gCode = gCodeParts.join(`
        `).replaceAll(/ {2}/ig, '').replaceAll('\n\n', '\n');
    }
};

let manipulate = {}; // functions for generating OpenJSCAD code are stored here in the form of methods. Becomes one of two objects with same methods for different code-writing purposes depending on przygotowka

function setFunctions() {
    switch (przygotowka.nazwa) {
        case `kostka`:
            manipulate = {...functionsKostka};
            report(`Ustawiono funkcje dla kostki. `);
            break;
        case `walec`:
            manipulate = {...functionsWalec};
            report(`Ustawiono funkcje dla walca. `);
            break;
        default:
            report(`Nie ustalono przygotówki. `);
            break;
    }
}

function drawModel() {
    processor.setJsCad(openjscadCode); // might want to make figure transparent
}

function calculateRemainder(a, b) {
    return (a * 1000) % (b * 1000) / 1000;
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
        let val = parseFloat(elements.inputs[i].value);
        if (isNaN(val)) {
            report(`Wymiary muszą być w postaci liczb. `);
            toRemove = 1;
            return;
        }
        loadTo.listaWymiarow[i] = val;
    }
    manipulate.checkValues(loadTo);
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
    clearHTML(elements.inputsList);
    clearHTML(elements.upperField);
    elements.upperField.appendChild(elements.choicesList); // only a template, will be filled later
}

function proceed(obj) {
    if (obj === przygotowka) {
        setFunctions();
    }
    processInput(obj); // checks for suitable input, stores input values in object, clears lower section, !rewrites upper section with choices already with listeners! . In case of obrobka, stores obrobka in przygotowka
    if (toRemove === 1) {
        toRemove = 0;
        return;
    }
    uploadHistory();
    manipulate.generateCodeFromScratch(); // rewrites code each time. Not much work cuz figure is redrawn anyways.
    // or
    /*
    if (obj === przygotowka) {
        manipulate.generatePrzygotowkaCode();
    } else if (obj === obrobka) {
        manipulate.generateObrobkaCode();
    }
     */
    drawModel();
    if (obj === przygotowka) {
        etapObrobki();
    }
}

function report(msg) {
    elements.console_log.innerHTML = `${msg} [${dateTimeFormat(2)}]`;
}

function uploadHistory() {
    clearHTML(elements.history);
    modifyHTML(elements.history, `<li>${przygotowka.nazwa}</li>`);
    /*
    for (let i = 0; i < przygotowka.kartaObrobki.listaObrobek.length; i++) {
        modifyHTML(elements.history, `<li>${i + 1}. ${przygotowka.kartaObrobki.listaObrobek[i].nazwa}</li>`);
    }
    */ // this way did not work o_O
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
        e.addEventListener('click', catchFromHistoryClick); //deactivating an element
        e.addEventListener('mouseenter', catchFromHistoryEnter); //drawing only that element
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

function catchFromHistoryClick() {
    if (this.innerHTML === przygotowka.nazwa) {
        return;
    }
    przygotowka.kartaObrobki.aktywne[parseFloat(this.innerHTML[0]) - 1] = !przygotowka.kartaObrobki.aktywne[parseFloat(this.innerHTML[0]) - 1];
    manipulate.generateCodeFromScratch();
    drawModel();
    uploadHistory();
}

let target = null;
let index = null;
function catchFromHistoryEnter() {
    if (isNaN(parseFloat(this.innerHTML[0]))) {
        return;
    }

    index = parseFloat(this.innerHTML[0]) - 1;
    target = przygotowka.kartaObrobki.listaObrobek[index];

    manipulate.highlight(target);
    drawModel();
}

function catchFromHistoryLeave() {
    if (isNaN(parseFloat(this.innerHTML[0]))) {
        return;
    }

    manipulate.generateCodeFromScratch();
    drawModel();

    index = null;
    target = null;
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
        setTimeout(manipulate.generateCodeFromScratch(), 1000);
    });
}
*/



// Main line:
/*
function guide() {
    let headerGuideText = `header guide text`;
    let leftListGuideText = `leftList guide text`;
    let drawingGuideText = `drawing guide text`;
    let rightListGuideText = `rightList guide text`;
    let dataInputGuideText = `dataInput guide text`;
    let footerGuideText = `footer guide text`;

    document.getElementsByTagName('body').innerHTML += `
<div id="guide">
    <div id="guide-header">
    </div>
    <div id="guide-leftList">
    </div>
    <div id="guide-drawing">
    </div>
    <div id="guide-rightList">
    </div>
    <div id="guide-dataInput">
    </div>
    <div id="guide-footer">
    </div>
</div>`;

    let guide = document.getElementById('guide');
    let headerGuide = document.getElementById('guide-header');
    let leftListGuide = document.getElementById('guide-leftList');
    let drawingGuide = document.getElementById('guide-drawing');
    let rightListGuide = document.getElementById('guide-rightList');
    let dataInputGuide = document.getElementById('guide-dataInput');
    let footerGuide = document.getElementById('guide-footer');

    // action

    // add a listener to a created button onClick -> etapPrzygotowki

}
*/

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
        proceed(przygotowka);
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
    }
}



// Exports and imports:
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
        manipulate.generateCodeFromScratch();
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



// Activation:
function bindListeners() {
    // Class "header":
    elements.btnStart.addEventListener('click', etapPrzygotowki);
    elements.btnGenerateGCode.addEventListener('click', function () {
        if (Object.keys(przygotowka).length === 0 || przygotowka.listaWymiarow[0] === undefined || przygotowka.kartaObrobki.listaObrobek[0] === undefined || przygotowka.kartaObrobki.listaObrobek[0].listaWymiarow[0] === undefined) {
            report(`Próba wygenerować kod obróbki. Model pusty. `);
            return;
        }

        manipulate.generateGCode();
        let a = document.createElement('a');
        a.href = "data:application/octet-stream," + encodeURIComponent(gCode);
        a.download = `g-code ${przygotowka.nazwa} (${dateTimeFormat(1)}).txt`;
        a.click();

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
    // Class "viewsList":
    /*
    for (let i = 0; i < elements.views.length; i++) {
        elements.views[i].addEventListener('click', selectPerspective);
    }
    */
    // Class "footer":
}

function go() {
    // show guide

    // add a button that listens to click and leads to bindListeners
    bindListeners();
}

go();

/*
{
const array1 = [];
for (let i = 1; i <= 4; i++) {
    array1.push({
        nazwa: `object ${i}`,
        opis: `blabla`,
        wymiary: [1, 2, 3, 4]
    });
}
console.log(array1);

const array2 = [];
for (let i = 1; i <= 4; i++) {
    array2.push(1);
}
console.log(array2);

const map1 = array1.map(e1 => {
    if (array2[array1.indexOf(e1)] === 1) {
        return `${e1.nazwa} ${e1.wymiary}`;
    }
});

console.log(map1);
}
 */
