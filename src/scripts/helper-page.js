module.exports = `
    <div id="help-page" style="font-size: 11px">
        <div class="app-container" style="font-weight: normal; font-size: 14px">
            <div class="header border border-2 border-primary rounded-1 p-1" style="position: relative;">
                <button class="btn btn-primary btn-sm" id="close-help-page" style="position: absolute; right: 4px;">Zamknij</button>
                <span class="d-md-flex justify-content-md-evenly">
                    W tym polu znajdują się przyciski: <br>
                    <ul>
                    <li>"Rozpocznij" - musisz go wcisnąć aby zacząć pracę</li>
                    <li>"Wygenerować kod obróbki" - jak skończysz pracę, wciśnij go aby wygenerować plik z kodem do obróbki</li>
                    <li>"Eksportować" - w każdy moment możesz wcisnąć go aby ściągnąć plik z danymi modelu, który można będzie użyć przy pomocy następnego przycisku</li>
                    <li>"Importować" - wciśnij jeśli chcesz wgrać poprzednio wygenerowany tutaj plik aby odtworzyć model</li>
                    </ul>
                </span>
            </div>
            <div class="leftList border border-2 border-primary rounded-1 p-1">
                W tym polu pojawią się dodane obróbki. <br>
                Jeśli <b>najechać kursorem na napis</b>, wyświetli się materiał, usunięty przy odpowiedniej obróbce. <br>
                <b>Klikając na napis</b> można wygasić odpowiednią obróbkę, klikając <b>ponownie</b> - przywrócić. Wygaszona obróbka nie wyświetla się na rysunku i nie tworzy się dla niej kod obróbki, ale należy
                <b>uważać - wygaszenie obróbki nie wpłynie na kolejne obróbki!</b> <br>
                Jeśli w tym polu jest chociażby przygotówka - można ściągnąć plik z danymi klikając przycisk "Eksportować" w polu wyżej. Jeśli jest chociażby jedna aktywna obróbka - można wygenerować kod obróbki klikając odpowiedni przycisk w polu wyżej.
            </div>
            <div class="drawing border border-2 border-primary">
                W tym polu znajduje się rysunek modelu. <br>
                Model można obracać ciągnąc myszką, można przybliżać i oddalać obracając kółko, a jeśli kółko wcisnąć - model przesunie się razem z kursorem. <br>
                Razem z modelem pojawiają się trzy strzałki wskazujące kierunki osi: <br> czerwona - oś X, zielona - oś Y, niebieska - oś Z.
            </div>
            <div class="rightList border border-2 border-primary rounded-1 p-1">
                W tym polu pojawiają się dostępne przygotówki i elementy dostępne do wykonania, które można wybrać klikając na nie.
            </div>
            <div class="dataInput border border-2 border-primary rounded-1 p-1">
                W tym polu, po wybraniu przygotówki lub elementu, pojawiają się pola do wpisywania ich wymiarów, i przyciski "Wstecz" i "Zapisz". Pierwszy przycisk przywraca listę przygotówek czy elementów w polu wyżej, drugi zapisuje wpisane dane. Zaraz po wciśnięciu przycisku "Zapisz" generuje się model. <br>
                Wartości należy podawać w milimetrach, jeśli nie podane są inne jednostki. <br>
                <b>Przy wpisaniu wartości dziesiętnych można używać jak kropki, tak i przycinku.<b> <br>
                Odczytywane są tylko liczby do pierwszego symbolu innego typu niż liczba, a jeśli występują dwie kropki lub dwa przecinki - odczytuje się liczbę do drugiej kropki lub przecinka. <br>
                <b>Wszystkie wartości ujemne są zamieniane na dodatnie.<b>
            </div>
            <div class="footer border border-2 border-primary rounded-1 p-1">
                W tym polu wyświetlają się komunikaty przy błędach, n.p. jeśli jako długość przygotówki zostanie wprowadzone zero.
            </div>
            <div class="helper border border-2 border-primary rounded-1 p-1">
                W tym polu wyświetlają się podpowiedzi dot. postępowań przy modelowaniu.
            </div>
        </div>
    </div>
`;
