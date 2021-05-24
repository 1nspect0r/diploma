const rowekCzolowy1 = { // это просто другое нажендже. Если д = 0, то нужно пройти немного дальше, на минус, чтобы спилить пипку.
    nazwa: `rowek czołowy`,
    opis: `<span class="opis-1"> Rowek czołowy. <br>
d0 - średnica zewnętrzna rowka <br>
d - średnica wewnętrzna <br>
h0 - początek toczenia w osi Z <br>
h - głębokość rowka <br>
r - długość drogi wycofania po jednym zanurzeniu <br>
q - głębokość jednego zanurzenia <br>
p - szerokość płytki oraz grubość jednego przejścia <br>
f - posuw <br>
Dla płytek, mierzonych do górnej krawędzi. </span>`,

    listaWymiarow: [],
    nazwyWymiarow: [`d0`, `d`, `h0`, `h`, `r`, `q [μm]`, `p [μm]`, `f`, `S [obr/min]`]
};
const rowekWzdluzny1 = { // отличается от toczenie1 направлением движений: точене двигается вдоль, опускаясь, а ровек - откусывает, шагая
    nazwa: `rowek wzdłużny`,
    opis: `<span class="opis-1"> Rowek wzdłużny. <br>
d0 - średnica początkowa obróbki <br>
d - średnica końcowa <br>
h0 - początek rowka w osi Z (kierunek ujemny) <br>
h - szerokość rowka <br>
r - długość drogi wycofania po jednym zanurzeniu <br>
p - głębokość jednego zanurzenia <br>
q - szerokość płytki oraz szerokość jednego zanurzenia <br>
f - posuw </span>`,

    listaWymiarow: [],
    nazwyWymiarow: [`d0`, `d`, `h0`, `h`, `r`, `p [μm]`, `q [μm]`, `f`, `S [obr/min]`]
};
const fazaWewn1 = {
    nazwa: `fazowanie wewnętrzne`,
    opis: `<span class="opis-1"> Fazowanie wewnętrzne (toczenie pod kątem 45 stopni). <br>
d - średnica (mniejsza) <br>
h - długość fazy <br>
h0 - początek fazy <br>
dx - ilość zdjętego materiału za przejście w osi X <br>
u - naddatek na obróbkę wykańczającą w osi X <br>
w - naddatek na obróbkę wykańczającą w osi Z <br>
f (zgr) - posuw dla obróbki zgrubnej <br>
f (wyk) - posuw dla obróbki wykańczającej </span>`,

    listaWymiarow: [],
    nazwyWymiarow: [`d`, `h`, `h0`, `dx`, `u`, `w`, `f (zgr)`, `f (wyk)`, `S [m/min]`]
};
const fazaZewn1 = {
    nazwa: `fazowanie zewnętrzne`,
    opis: `<span class="opis-1"> Fazowanie zewnętrzne (toczenie pod kątem 45 stopni). <br>
d - średnica (większa) <br>
h - długość fazy <br>
h0 - początek fazy w osi Z (kierunek ujemny) <br>
dx - ilość zdjętego materiału za przejście w osi X <br>
u - naddatek na obróbkę wykańczającą w osi X <br>
w - naddatek na obróbkę wykańczającą w osi Z <br>
f (zgr) - posuw dla obróbki zgrubnej <br>
f (wyk) - posuw dla obróbki wykańczającej </span>`,

    listaWymiarow: [],
    nazwyWymiarow: [`d`, `h`, `h0`, `dx`, `u`, `w`, `f (zgr)`, `f (wyk)`, `S [m/min]`]
};
const otwor1 = {
    nazwa: 'otwór',
    opis: `<span class="opis-1"> Otwór. <br>
h0 - początek otworu <br>
h - głębokość otworu <br>
d - średnica otworu <br>
r - długość drogi wycofania po jednym zanurzeniu <br>
q - głębokość jednego zanurzenia <br>
f - posuw <br>
Oś otworu jest osią walca. <br>
Stożek o kącie 120 stopni. </span>`,

    listaWymiarow: [],
    nazwyWymiarow: [`h0`, `h`, `d`, `r`, `q [μm]`, `f`, `S [obr/min]`]
};
const toczenie1 = {
    nazwa: `toczenie`,
    opis: `<span class="opis-1"> Toczenie. <br>
d0 - średnica początkowa obróbki <br>
d - średnica końcowa <br>
h0 - początek drogi skrawania w osi Z (kierunek ujemny; narzędzie wejdzie w materiał o 1 mm wcześniej) <br>
h - długość drogi skrawania <br>
dx - ilość zdjętego materiału za przejście w osi X <br>
u - naddatek na obróbkę wykańczającą w osi X <br>
w - naddatek na obróbkę wykańczającą w osi Z <br>
f (zgr) - posuw dla obróbki zgrubnej <br>
f (wyk) - posuw dla obróbki wykańczającej <br>
S - prędkość obrotowa wrzeciona prędkość skrawania <br>
UWAGA! Grubość warstwy nie wlicza się do następujących obróbek, należy podawać wartości uwzględniając obróbkę czoła! </span>`,

    listaWymiarow: [],
    nazwyWymiarow: [`d0`, `d`, `h0`, `h`, `dx`, `u`, `w`, `f (zgr)`, `f (wyk)`, `S [m/min]`]
};
export const walec = {
    nazwa: `walec`,
    opis: `<span class="opis-1"> Walec. <br>
S max - maksymalna prędkość obrotu wrzeciona </span>`,

    listaWymiarow: [],
    nazwyWymiarow: ['średnica', 'długość', 'S max [obr/min]'],

    kartaObrobki: {
        listaObrobek: [],
        aktywne: [],
        dostepneObrobki: [toczenie1, otwor1, fazaZewn1, fazaWewn1, rowekWzdluzny1, rowekCzolowy1]
    }
};

/*
export const opisy = [walecOpis, toczenie1opis, otwor1opis, fazaZewn1opis, fazaWewn1opis, rowekWzdluzny1opis, rowekCzolowy1opis];
const walecOpis = `<span class="opis-1"> Walec. <br>
</span>`;
const toczenie1opis = `<span class="opis-1"> Toczenie. <br>
d0 - średnica początkowa obróbki <br>
d - średnica końcowa <br>
h0 - początek drogi skrawania w osi Z (kierunek ujemny; narzędzie wejdzie w materiał o 1 mm wcześniej) <br>
h - długość drogi skrawania <br>
dx - ilość zdjętego materiału za przejście w osi X <br>
u - naddatek na obróbkę wykańczającą w osi X <br>
w - naddatek na obróbkę wykańczającą w osi Z <br>
f (zgr) - posuw dla obróbki zgrubnej <br>
f (wyk) - posuw dla obróbki wykańczającej <br>
UWAGA! Grubość warstwy nie wlicza się do następujących obróbek, należy podawać wartości uwzględniając obróbkę czoła! </span>`;
const otwor1opis = `<span class="opis-1"> Otwór. <br>
h0 - początek otworu <br>
h - głębokość otworu <br>
d - średnica otworu <br>
r - długość drogi wycofania po jednym zanurzeniu <br>
q - głębokość jednego zanurzenia <br>
f - posuw <br>
Oś otworu jest osią walca. <br>
Stożek o kącie 120 stopni. </span>`;
const fazaZewn1opis = `<span class="opis-1"> Fazowanie zewnętrzne (toczenie pod kątem 45 stopni). <br>
d - średnica (większa) <br>
h - długość fazy <br>
h0 - początek fazy w osi Z (kierunek ujemny) <br>
dx - ilość zdjętego materiału za przejście w osi X <br>
u - naddatek na obróbkę wykańczającą w osi X <br>
w - naddatek na obróbkę wykańczającą w osi Z <br>
f (zgr) - posuw dla obróbki zgrubnej <br>
f (wyk) - posuw dla obróbki wykańczającej </span>`;
const fazaWewn1opis = `<span class="opis-1"> Fazowanie wewnętrzne (toczenie pod kątem 45 stopni). <br>
d - średnica (mniejsza) <br>
h - długość fazy <br>
h0 - początek fazy <br>
dx - ilość zdjętego materiału za przejście w osi X <br>
u - naddatek na obróbkę wykańczającą w osi X <br>
w - naddatek na obróbkę wykańczającą w osi Z <br>
f (zgr) - posuw dla obróbki zgrubnej <br>
f (wyk) - posuw dla obróbki wykańczającej </span>`;
const rowekWzdluzny1opis = `<span class="opis-1"> Rowek wzdłużny. <br>
d0 - średnica początkowa obróbki <br>
d - średnica końcowa <br>
h0 - początek rowka w osi Z (kierunek ujemny) <br>
h - szerokość rowka <br>
r - długość drogi wycofania po jednym zanurzeniu <br>
p - głębokość jednego zanurzenia <br>
q - szerokość płytki oraz szerokość jednego zanurzenia <br>
f - posuw </span>`;
const rowekCzolowy1opis = `<span class="opis-1"> Rowek czołowy. <br>
d0 - średnica zewnętrzna rowka <br>
d - średnica wewnętrzna <br>
h0 - początek toczenia w osi Z <br>
h - głębokość rowka <br>
r - długość drogi wycofania po jednym zanurzeniu <br>
q - głębokość jednego zanurzenia <br>
p - szerokość płytki oraz grubość jednego przejścia <br>
f - posuw <br>
Dla płytek, mierzonych do górnej krawędzi. </span>`;

 */
