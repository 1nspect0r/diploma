module.exports =`<div id="help-page" style="font-size: 11px">
    <div class="help-container">
        <div class="header border border-2 border-primary rounded-1 p-1" style="position: relative;">
            <button class="btn btn-dark btn-sm" id="close-help-page" style="position: absolute; right: 4px;">Zamknij</button>
            <div class="d-md-flex justify-content-md-evenly">
                W tym polu znajdują się przyciski: <br>
                <ul>
                    <li>"Rozpocznij" - musisz go wcisnąć aby zacząć pracę</li>
                    <li>"Wygenerować kod obróbki" - jak skończysz pracę, wciśnij go aby wygenerować plik z kodem do obróbki</li>
                    <li>"Eksportować" - w każdy moment możesz wcisnąć go aby ściągnąć plik z danymi modelu, który można będzie użyć przy pomocy następnego przycisku</li>
                    <li>"Importować" - wciśnij jeśli chcesz wgrać poprzednio wygenerowany tutaj plik aby odtworzyć model</li>
                </ul>
            </div>
        </div>
        <div class="leftList border border-2 border-primary rounded-1 p-1">
            <div class="text-centered">
            W tym polu pojawią się dodane obróbki. <br>
            Jeśli najechać kursorem na napis, wyświetli się materiał, usunięty przy odpowiedniej obróbce. <br>
            Klikając na napis można wygasić odpowiednią obróbkę, klikając ponownie - przywrócić. Wygaszona obróbka nie wyświetla się na rysunku i nie tworzy się dla niej kod obróbki, ale należy
            uważać - wygaszenie obróbki nie wpłynie na kolejne obróbki! <br>
            Jeśli w tym polu jest chociażby przygotówka - można ściągnąć plik z danymi klikając przycisk "Eksportować" w polu wyżej. Jeśli jest chociażby jedna aktywna obróbka - można wygenerować kod obróbki klikając odpowiedni przycisk w polu wyżej.
            </div>
        </div>
        <div class="drawing border border-2 border-primary">
            <div class="text-centered">
            W tym polu znajduje się rysunek modelu. <br>
            Model można obracać ciągnąc myszką, można przybliżać i oddalać obracając kółko, a jeśli kółko wcisnąć - model przesunie się razem z kursorem. <br>
            Razem z modelem pojawiają się trzy strzałki wskazujące kierunki osi: <br> czerwona - oś X, zielona - oś Y, niebieska - oś Z.
            </div>
        </div>
        <div class="rightList border border-2 border-primary rounded-1 p-1">
            <div class="text-centered">
            W tym polu pojawiają się dostępne przygotówki i elementy dostępne do wykonania, które można wybrać klikając na nie.
            </div>
        </div>
        <div class="dataInput border border-2 border-primary rounded-1 p-1">
            <div class="text-centered">
            W tym polu, po wybraniu przygotówki lub elementu, pojawiają się pola do wpisywania ich wymiarów, i przyciski "Wstecz" i "Zapisz". Pierwszy przycisk przywraca listę z pola wyżej, drugi zapisuje wpisane dane. Zaraz po wciśnięciu przycisku "Zapisz" generuje się model. <br> <br>
            Wartości należy podawać w milimetrach, jeśli nie podane są inne jednostki. Przy wpisaniu wartości dziesiętnych można używać jak kropki, tak i przycinku. Odczytywane są tylko liczby, do pierwszego symbolu innego niż liczba, a jeśli występują dwie kropki lub dwa przecinki - odczytuje się liczbę do drugiej kropki lub przecinku. Wszystkie wartości ujemne są zamieniane na dodatnie.
            </div>
        </div>
        <div class="footer border border-2 border-primary rounded-1 p-1">
            <div class="text-centered">
            Tu wyświetlają się komunikaty przy błędach, n.p. jeśli jako długość przygotówki zostanie wprowadzone zero.
            </div>
        </div>
        <div class="helper border border-2 border-primary rounded-1 p-1">
            <div class="text-centered">
            Tu wyświetlają się podpowiedzi.
            </div>
        </div>
    </div>
</div>
`;
