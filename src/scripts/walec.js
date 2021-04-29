/*
let x = {
    nazwa: ``,
    opis: ``,

    listaWymiarow: [],
    nazwyWymiarow: [``]
};
*/
let rowekCzolowy1 = { // это просто другое нажендже. Если д = 0, то нужно пройти немного дальше, на минус, чтобы спилить пипку.
    nazwa: `rowek czołowy`,
    opis: `Rowek czołowy. <br>
d0 - średnica zewnętrzna rowka; <br>
d - średnica wewnętrzna; <br>
h0 - początek toczenia w osi Z; <br>
h - głębokość rowka.`,

    listaWymiarow: [],
    nazwyWymiarow: [`d0`, `d`, `h0`, `h`]
};
let rowekWzdluzny1 = { // отличается от toczenie1 направлением движений: точене двигается вдоль, опускаясь, а ровек - откусывает, шагая
    nazwa: `rowek wzdłużny`,
    opis: `Rowek wzdłużny. <br>
d0 - średnica początkowa obróbki; <br>
d - średnica końcowa; <br>
h0 - początek rowka w osi Z; <br>
h - szerokość rowka.`,

    listaWymiarow: [],
    nazwyWymiarow: [`d0`, `d`, `h0`, `h`]
};
let fazaWewn1 = {
    nazwa: `fazowanie wewnętrzne`,
    opis: `Fazowanie zewnętrzne pod kątem 45 stopni. <br>
d - średnica (mniejsza); <br>
h - długość fazy;  <br>
h0 - początek fazy.`,

    listaWymiarow: [],
    nazwyWymiarow: [`d`, `h`, `h0`]
};
let fazaZewn1 = {
    nazwa: `fazowanie zewnętrzne`,
    opis: `Fazowanie zewnętrzne pod kątem 45 stopni. <br>
d - średnica (większa); <br>
h - długość fazy;  <br>
h0 - początek fazy.`,

    listaWymiarow: [],
    nazwyWymiarow: [`d`, `h`, `h0`]
};
let otwor1 = {
    nazwa: 'otwór',
    opis: `Otwór. <br>
Wymiary: <br>
h0 - początek otworu; <br>
h - głębokość otworu; <br>
d - średnica otworu; <br>
Oś otworu jest osią walca. <br>
Płaszczyzną bazową jest płaszczyzna XY. <br>
Stożek o kącie 120 stopni.`,

    listaWymiarow: [],
    nazwyWymiarow: [`h0`, `h`, `d`]
};
let toczenie1 = {
    nazwa: `toczenie`,
    opis: `Toczenie. <br>
d0 - średnica początkowa obróbki; <br>
d - średnica końcowa; <br>
h0 - początek drogi skrawania w osi Z; <br>
h - długość drogi skrawania.`,

    listaWymiarow: [],
    nazwyWymiarow: [`d0`, `d`, `h0`, `h`]
};
export let walec = {
    nazwa: `walec`,
    opis: `Walec. <br>
`,

    listaWymiarow: [],
    nazwyWymiarow: ['średnica', 'długość'],

    kartaObrobki: {
        listaObrobek: [],
        dostepneObrobki: [toczenie1, otwor1, fazaZewn1, fazaWewn1, rowekWzdluzny1, rowekCzolowy1]
    }
};
