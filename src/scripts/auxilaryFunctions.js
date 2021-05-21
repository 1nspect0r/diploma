export function clearHTML(htmlElement) {
    if (htmlElement) {
        htmlElement.innerHTML = null;
    }
}
export function modifyHTML(htmlListElement, value) {
    htmlListElement.innerHTML += value;
}

/*
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
*/

/*
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
*/

export function dateTimeFormat(n) {

    let _year = new Date().getFullYear();
    let _month = 1 + (new Date().getMonth());
    let _day = new Date().getDate();
    let _hours = new Date().getHours();
    let _minutes = new Date().getMinutes();
    let _seconds = new Date().getSeconds();

    switch(n) {
        case 1:
            {
                let dateTimeArray = [];
                [_year, _month, _day, _hours, _minutes, _seconds].forEach(e => dateTimeArray.push(`${e}`));
                doIt(dateTimeArray);
                return `${dateTimeArray[0]}-${dateTimeArray[1]}-${dateTimeArray[2]}, ${dateTimeArray[3]}-${dateTimeArray[4]}-${dateTimeArray[5]}`;
            }
        case 2:
            {
                let dateTimeArray = [];
                [_hours, _minutes, _seconds].forEach(e => dateTimeArray.push(`${e}`));
                doIt(dateTimeArray);
                return `${dateTimeArray[0]}:${dateTimeArray[1]}:${dateTimeArray[2]}`;
            }
        default:
            console.log(`[in-code error] bad dateTimeFormat "n" parameter: `);
            console.log(n);
            return `error`;
    }

    function doIt(dateTimeArray) {
        for (let i = 0; i < dateTimeArray.length; i++) {
            if (dateTimeArray[i].length < 2 && dateTimeArray[i] !== `${_year}`) {
                dateTimeArray[i] = `0${dateTimeArray[i]}`;
            }
        }
    }
}
