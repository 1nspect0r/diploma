/*
let x = {
    nazwa: ``,
    opis: ``,

    listaWymiarow: [],
    nazwyWymiarow: [``]
};
*/
const rowekKolowy1 = {
    nazwa: `rowek kołowy`,
    opis: `Rowek kołowy. <br>
Wymiary: <br>
x0, y0 - współrzędne osi symetrii rowka; <br>
R - promień ścieżki narzędzia; <br>
l - szerokość rowka; <br>
h - głębokość rowka. `,

    listaWymiarow: [],
    nazwyWymiarow: [`x0`, `y0`, `R`, `l`, `h`]
};
const czolo1 = {
    nazwa: `czoło`,
    opis: `Obróbka czoła. <br>
Wymiary: <br>
h - grubość warstwy. <br>
Grubość warstwy nie wlicza się do następujących obróbek, należy podawać wartości uwzględniając obróbkę czoła!`,

    listaWymiarow: [],
    nazwyWymiarow: [`h`]
};
const kieszenOkragla1 = {
    nazwa: `kieszeń okrągła`,
    opis: `Kieszeń okrągła. <br>
Wymiary: <br>
x0, y0 - współrzędne ośi symetrii kieszeni; <br>
r - promień kieszeni; <br>
h - głębokość kieszeni.` ,

    listaWymiarow: [],
    nazwyWymiarow: [`x0`, `y0`, `r`, `h`]
};
const kieszenProstokatna1 = {
    nazwa: `kieszeń prostokątna`,
    opis: `Kieszeń prostokątna. <br>
Wymiary: <br>
x0, y0 - odległość najbliższego boku kieszeni odpowiedniej osi (offset); <br>
x, y - wymiary kieszeni; <br>
h - głębokość kieszeni; <br>
r - promień zaokrąglenia naroża. `,

    listaWymiarow: [],
    nazwyWymiarow: [`x0`, `y0`, `x`, `y`, `h`, `r`]
};
const otwor1 = {
    nazwa: `otwór`,
    opis: `Otwór. <br>
Wymiary: <br>
x, y - położenie osi otworu w osiach odpowiednio X i Y; <br>
d, h - średnica i głębokość otworu. <br>
Oś otworu jest prostoliniowa do osi Z. <br>
Stożek o kącie 120 stopni. `,

    listaWymiarow: [],
    nazwyWymiarow: [`x`, `y`, `d`, `h`]
};
export const kostka = {
    nazwa: `kostka`,
    opis: `Kostka. <br>
Szerokość - wymiar w X. <br>
Długość - wymiar w Y. <br>
Wysokość - wymiar w Z. `,

    listaWymiarow: [],
    nazwyWymiarow: ['szerokość', 'długość', 'wysokość'],

    kartaObrobki: {
        listaObrobek: [],
        dostepneObrobki: [czolo1, otwor1, kieszenProstokatna1, kieszenOkragla1, rowekKolowy1]
    }
};
