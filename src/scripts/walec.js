export let otworWalec = {
    nazwa: 'otwór',
    opis: `Otwór.
Wymiary:
d, h - średnica i głębokość otworu.
Oś otworu jest osią walca.
Stożek o kącie 120 stopni.`,


    listaWymiarow: [0, 0],
    nazwyWymiarow: [`d`, `h`]
};
export let kartaObrobkiWalec = {
    listaObrobek: [],
    dostepneObrobki: [otworWalec]
};
export let walec = {
    nazwa: `walec NIE WOLNO`,
    opis: `Walec. `,

    listaWymiarow: [0, 0],
    nazwyWymiarow: ['średnica', 'długość'],

    kartaObrobki: { ...kartaObrobkiWalec }
};
