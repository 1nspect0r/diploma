let elements = require('./elements.js');
let perspectives = [`isometric`, `plane XY`, `plane YZ`, `plane ZX`];

export function selectPerspective() {
    for (let i = 0; i < elements.views.length; i++) {
        if (this.innerHTML === elements.views[i].innerHTML) {
            perspective.innerHTML = perspectives[i];
            makeActive(this);
        }
    }
}

export function makeActive(option) {
    for (let i = 0; i < elements.activeElements.length; i++) {
        elements.activeElements[i].classList.remove(`active`);
    }

    option.classList.add(`active`);
}

export function clearHTML(htmlElement) {
    if (htmlElement) {
        htmlElement.innerHTML = null;
    }
}

export function appendHTML(HTMLid, value) {
    HTMLid.innerHTML += value;
}

export function generateGCode(przygotowka) {
    let a = przygotowka.value;
    let b = a.kartaObrobki.listaObrobek;
    let c = ``;

    for (let i of b) {
        console.log(i);
        if (i.nazwa === `otwor`) {
            c +=
                `T0000 # Wybrać wiertło o średnicy ${i.listaWymiarow[2]}
                G00 X${i.listaWymiarow[0]} Y${i.listaWymiarow[1]} Z02
                G01 Z${i.listaWymiarow[3]}
                G01 Z02`;
        }
    }
}

/*
function readObject(object) {
    przygotowka = listaPrzygotowek[0];
    przygotowka.listaWymiarow = [1, 2, 3];
}*/
