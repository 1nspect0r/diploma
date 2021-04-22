export let otworKostka = {
    nazwa: 'otwór',
    opis: `Otwór.
Wymiary:
x, y - położenie osi otworu w osiach odpowiednio X i Y;
d, h - średnica i głębokość otworu.
Oś otworu jest prostoliniowa do osi Z.
Stożek o kącie 120 stopni.`,

    listaWymiarow: [0, 0, 0, 0],
    nazwyWymiarow: [`x`, `y`, `d`, `h`]
};
export let kartaObrobkiKostka = {
    listaObrobek: [],
    dostepneObrobki: [otworKostka]
};
export let kostka = {
    nazwa: `kostka`,
    opis: `Kostka. `,

    listaWymiarow: [0, 0, 0],
    nazwyWymiarow: ['szerokość', 'długość', 'wysokość'],

    kartaObrobki: { ...kartaObrobkiKostka }
};
