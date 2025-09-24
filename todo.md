nie wszytskie labels sa przetuamczone, wyszukaj te ktore nie maja id i class i przetłumacz
class="welcome-message"

sprawdz dlaczego gdy jest sustawiony w url jzyk pl to powjawiaj sie napisy w innym jezyku
spoarwdzd dlaczego przy przechodzeniu pomiedzy stronami nie zmieaniaja sie dynamicznie tlumaczenia labels?


wysoko ekranu bedzie max 30% szerokosci, dlatego zoptymalizuj wyswietlanie, by wszystko co da sie wyswietlic bylo mozliwe w takich prooprcjach
jesli sie nie da to zmien uklad i zrob nowe menu, zeby zmiescic w innyej podstronie 


Następne kroki:
Opcja A: Kontynuować z podziałem Workshop Enhanced (także priorytet wysoki) Opcja B: Zająć się problemami z tłumaczeniami które wymieniłeś w 
todo.md

Znalezienie i przetłumaczenie etykiet bez id/class
Naprawienie przełączania języków gdy URL ma ustawiony język 'pl'


Kolejne kroki to implementacja podziału pozostałych dużych modułów 
(Test Menu i System Settings) oraz rozwiązanie kwestii związanych z tłumaczeniami i przełączaniem języków.



kontynuuj refaktoryzacje podziel modularnie i komplementarnie aktualny kod,, aby nie bylo plikow .js wikszych od 450linii kodu
i dokumentuj w docs


Główne zadania modularyzacji zostały ukończone! Teraz możemy skupić się na:

Testowaniu funkcjonalności - walidacja wszystkich podzielonych modułów
Naprawie problemów z lokalizacją - znalezienie nieprzetłumaczonych etykiet
Utworzeniu modułu Analytics Dashboard - nowy moduł analityczny
Implementacji Workflow Engine - automatyzacja zgodna ze standardami PN-EN
System MASKSERVICE C20 jest teraz w pełni zmodularyzowany z intuicyjnymi, wyspecjalizowanymi podmenu dla lepszej użyteczności i organizacji!



wysokosc ekranu ma 30% szerokosci, dlatego zoptymalizuj wyswietlanie, by
wszystko co da sie wyswietlic bylo mozliwe w takich prooprcjach na ekranie LCD IPS 7.9" z ekranem dotykowym o Rozdzielczości 400x1280 pikseli. 
jesli danych jest za duo, odstepy s minimalne i czcionki nie da sie zmniejszyc, bo byaby nieczytelna
to zmien uklad i dodaj nowe menu i nowy widok, rozbijajac na dwa odzielne w zaleznosci od kontekstu
zachowaj minimalne odstepy padding i margin, w zawartosci w centrum, aby zmiescic wiecej informacji, aby nie byla zbyt dluga, gdyz mamy wiecej przestrzeni na szerokosc


jesli w menu jest wiecej pozycji niz 10 to w zaleznosci od roli usera pokazuj tylko istotne z punktu widzeni a roli elementy
ustaw w pliku  config/menu.json  role tak, by komplementarnie kazda rola miala wlasna specjalziacje i wlasne menu, unikalne, tak by 
wiekszosc elmentow menu  byly zarezerowane dla jednej roli


w momencie wpisywania hasla nie pozwalaj na pokazywanie systemowej klawiatury w urzadzeniach mobilnych
 gdyz wpisywanie znakow obsluguje nasza wlasna klawiatura

operator ma za zadanie przeprowadzi testy, dlatego jego menu musi by ograniczone do tetsw i raportw

scenariusze testowe moga by uzupenione przez inne role, ale oni nie musi testowa tylko zarzadzac rolami, 
najwiecej opcji ma serwisant, ale on nie testuje i nie raportuje

przeanalizuj translacje i popraw gdzi jeszcze sa dodane atrybuty data-i18n

dodaj do kazdego  .pressure-item  wizualizacje wykres zmian jako kolejny element pressure-*-dia
gdzie w czasie rzeczywistym bdzie pokazywanych ostatnich 60  pomiarow (przez 60 sekund)
<div class="pressure-item">
    <div id="pressure-high-label" class="pressure-label">Wysokie</div>
    <div id="pressure-high" class="pressure-value">30.5</div>
    <div id="pressure-high-unit" class="pressure-unit">bar</div>
    <div id="pressure-high-dia" class="pressure-dia"></div>
</div>


przeanalizuj translacje i popraw gdzi jeszcze sa dodane atrybuty data-i18n
wykorzystaaj jakis framework do ladowania zaleznosci , aby nie trzeba bylo analizowac, tylko automatycznie kaskadoiwo ladowal o sie to co trzeba
lub zwyczajnie linkuj przed zaladowaniem modulu inne, w razie gdyby nie byly zaladowane w dopowiedniej kolejnosci
rob zaleznosci jak w node js, ale dla frontendu

kontynuuj refaktoryzacje podziel modularnie i komplementarnie aktualny kod,, aby nie bylo plikow .js wikszych od 450linii kodu
i dokumentuj w docs


zamiast wyskakujacych okienek przegladarki uzyj zwyklego formularza, 
ale w poziomie a nie pionie, jedna pod druga tylko jedno pole obok drugiego i na koniec akcja: zatwierdz/wyslij

wszelkie dane z plikow .js przenies do plikow config/*.json i laduj i uzywaj
czy aktualnie s jakies duplikaty kodu lub plikow? sprawdz i usun

przycisk .btn-logout nie dziala, powinien wylogowac i wrocic do ekranu startowego z loogowaniem

edycja, dodawanie userow nie dziala

ustandaryzuj import/export danych w 3 formatach: json, xml, csv oraz export do wydruku w pdf bezposrerednio z JS w miejscach, gdzie sa dane


--

biorc pod uwage pliki z config/*.json uzyj tego rozwizania edytora do edycji i nadpisywania poprzez usluge API python wraz z serwowaniem calego projektu ze wszystkimi plikami
uwzglednij schema, ktore sprawdza poprawnosc danych
Ustandaryzuj import/export danych (JSON, XML, CSV)
Dodaj eksport do PDF bezpośrednio z JavaScript