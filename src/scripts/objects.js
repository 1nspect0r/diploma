// Obróbki:
export let otworKostka = {
    nazwa: 'otwór',
    opis: `Otwór. <br>
    Wymiary: <br>
    x, y - położenie osi otworu w osiach odpowiednio X i Y; <br>
    d, h - średnica i głębokość otworu. <br>
    Oś otworu jest prostoliniowa do osi Z. <br>
    Stożek o kącie 120 stopni.`,

    listaWymiarow: [],
    nazwyWymiarow: [`x`, `y`, `d`, `h`]
};
export let otworWalec = {
    nazwa: 'otwór',
    opis: `Otwór. <br>
    Wymiary: <br>
    d, h - średnica i głębokość otworu. <br>
    Oś otworu jest osią walca. <br>
    Stożek o kącie 120 stopni.`,

    listaWymiarow: [],
    nazwyWymiarow: [`d`, `h`]
};

// Karty obróbek:
export let kartaObrobkiKostka = {
    listaObrobek: [],
    listaElementow: [otworKostka],

    nowyOtwor: function(x, y, d, h) {
        let otwor = { ...otworKostka };
        otwor.listaWymiarow = [x, y, d, h];
        this.listaObrobek.push(otwor);
    }
};
export let kartaObrobkiWalec = {
    listaObrobek: [],
    listaElementow: [otworWalec],

    nowyOtwor: function(d, h) {
        let otwor = { ...otworWalec };
        otwor.listaWymiarow = [d, h];
        this.listaObrobek.push(otwor);
    }
};

// Przygotowki:
export let kostka = {
    nazwa: `kostka`,

    listaWymiarow: [],
    nazwyWymiarow: ['szerokość', 'długość', 'wysokość'],

    kartaObrobki: { ...kartaObrobkiKostka }
};
export let walec = {
    nazwa: `walec`,

    listaWymiarow: [],
    nazwyWymiarow: ['średnica', 'długość'],

    kartaObrobki: { ...kartaObrobkiWalec }
};
export const listaPrzygotowek = [kostka, walec];
