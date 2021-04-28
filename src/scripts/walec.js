/*
let x = {
    nazwa: ``,
    opis: ``,

    listaWymiarow: [],
    nazwyWymiarow: [``]
};
*/
let toczenieWzdluzne1 = {
    nazwa: `toczenie wzdłużne`,
    opis: `Toczenie wzdłużne. <br>
d0 - średnica początkowa obróbki; <br>
d - średnica końcowa; <br>
h - długość toczenia.`,

    listaWymiarow: [],
    nazwyWymiarow: [`d0`, `d`, `h`]
};
let otwor1 = {
    nazwa: 'otwór',
    opis: `Otwór. <br>
Wymiary: <br>
d, h - średnica i głębokość otworu. <br>
Oś otworu jest osią walca. <br>
Płaszczyzną bazową jest płaszczyzna XY. <br>
Stożek o kącie 120 stopni.`,

    listaWymiarow: [],
    nazwyWymiarow: [`d`, `h`]
};
export let walec = {
    nazwa: `walec`,
    opis: `Walec. <br>
`,

    listaWymiarow: [],
    nazwyWymiarow: ['średnica', 'długość'],

    kartaObrobki: {
        listaObrobek: [],
        dostepneObrobki: [toczenieWzdluzne1, otwor1]
    }
};
