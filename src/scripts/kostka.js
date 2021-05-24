const rowekKolowy1 = {
    nazwa: `rowek kołowy`,
    opis: `Rowek kołowy. <br>
x0, y0 - współrzędne osi symetrii rowka <br>
R - promień środka rowka <br>
l - szerokość rowka <br>
h - głębokość rowka <br>
f - posuw `,

    listaWymiarow: [],
    nazwyWymiarow: ['x0', 'y0', 'R', 'l', 'h', 'średnica narzędzia', 'grubość przejścia w Z', `f`]
};
const kieszenOkragla1 = {
    nazwa: `kieszeń okrągła`,
    opis: `Kieszeń okrągła. <br>
x0, y0 - współrzędne ośi symetrii kieszeni <br>
r - promień kieszeni <br>
h - głębokość kieszeni <br>
f - posuw `,

    listaWymiarow: [],
    nazwyWymiarow: ['x0', 'y0', 'r', 'h', 'średnica narzędzia', 'grubość przejścia w Z', `f`]
};
const kieszenProstokatna1 = {
    nazwa: `kieszeń prostokątna`,
    opis: `Kieszeń prostokątna. <br>
x0, y0 - odległość najbliższego boku kieszeni odpowiedniej osi (offset) <br>
x, y - wymiary kieszeni <br>
h - głębokość kieszeni <br>
r - promień zaokrąglenia naroża <br>
f - posuw `,

    listaWymiarow: [],
    nazwyWymiarow: ['x0', 'y0', 'x', 'y', 'h', 'r', 'grubość przejścia w Z', `f`]
};
const otwor1 = {
    nazwa: `otwór`,
    opis: `Otwór. <br>
x, y - położenie osi otworu w osiach odpowiednio X i Y <br>
d - średnica otworu <br>
h - głębokość otworu <br>
f - posuw <br>
Oś otworu jest prostoliniowa do osi Z. <br>
Stożek o kącie 120 stopni.`,

    listaWymiarow: [],
    nazwyWymiarow: ['x', 'y', 'd', 'h', `f`]
};
const czolo1 = {
    nazwa: `czoło`,
    opis: `Obróbka czoła. <br>
h - grubość warstwy do zdjęcia <br>
f - posuw <br>
UWAGA! Przy modelowaniu należy uwzględniać grubość warstwy, jakby nie była zdjęta. Kod obróbki natomiast będzie uwzględniał wszystkie zmiany, oby zmniejszyć ilość ruchów roboczych poza przedmiotem obrabianym. `,

    listaWymiarow: [],
    nazwyWymiarow: ['h', 'średnica narzędzia', 'grubość przejścia w Z', `f`]
};
export const kostka = {
    nazwa: `kostka`,
    opis: `Kostka. <br>
szerokość - wymiar w osi X <br>
długość - wymiar w osi Y <br>
wysokość - wymiar w osi Z `,

    listaWymiarow: [],
    nazwyWymiarow: ['szerokość', 'długość', 'wysokość'],

    kartaObrobki: {
        listaObrobek: [],
        aktywne: [],
        dostepneObrobki: [czolo1, otwor1, kieszenProstokatna1, kieszenOkragla1, rowekKolowy1]
    }
};
