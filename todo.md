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



kontynuuj refaktoryzacje podziel modularnie i komplementarnie aktualny kod,, aby nie byklo plikow .js wikszych od 450linii kodu
i dokumentuj w docs


Główne zadania modularyzacji zostały ukończone! Teraz możemy skupić się na:

Testowaniu funkcjonalności - walidacja wszystkich podzielonych modułów
Naprawie problemów z lokalizacją - znalezienie nieprzetłumaczonych etykiet
Utworzeniu modułu Analytics Dashboard - nowy moduł analityczny
Implementacji Workflow Engine - automatyzacja zgodna ze standardami PN-EN
System MASKTRONIC C20 jest teraz w pełni zmodularyzowany z intuicyjnymi, wyspecjalizowanymi podmenu dla lepszej użyteczności i organizacji!



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
najwiecej opcji ma serviceuser, ale on nie testuje i nie raportuje

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




przy naciksaniu kolejnych buttonow z menu pojawiaja sie bledy

Template Not Found

Template "device-history-template" is not available.

http://localhost:8084/#/user-menu-screen/pl/default

http://localhost:8084/#/user-menu-screen/pl/default





te funkcje nie ładują template, zrob funkcje walidujaca czy na prawde zaladowal sie template a nie tylko czy kliknieto, wywołało daną funkcję, sprawdzaj i loguj dokladniej proces ladowania stron oraz sprawdzaj czy po kliknięciu na bautton zadziałał router i zmienił url, aby było wiadomo czy jest problem z routerem

window.MenuManager.selectMenuOption('settings_scenarios')
window.MenuManager.selectMenuOption('settings_integration')
window.MenuManager.selectMenuOption('settings_standards')


Nie działa zmiana jezyka, ani dynamiczna zmiana sensorów, 

sprawdz czy wszystkie pliki JS są wykorzystywane, czy nie ma duplikatów i czy któreś wymagają podlinkowania do danej funkcji



większosć wygenerowanych widoków we views/*/*.html mają niepoprawną strukturę



ustandaryzuj import/export danych w 3 formatach: json, xml, csv oraz export do wydruku w pdf bezposrerednio z JS w miejscach, gdzie sa dane



--

biorąc pod uwage pliki z config/*.json uzyj tego rozwizania edytora do edycji i nadpisywania poprzez usluge API python wraz z serwowaniem calego projektu ze wszystkimi plikami
uwzglednij schema, ktore sprawdza poprawnosc danych
Ustandaryzuj import/export danych (JSON, XML, CSV)
Dodaj eksport do PDF bezpośrednio z JavaScript



zacznij stosować vue w projekcie zamiast aktualnych modułów i stopniowo usuwaj vanillia na rzecz vue w kolejnych miejscach
przenoś zawartośc do nowych plikow frameworka vue 
usuwaj kolejne fragmenty html i pliki .js



wyodrebnij z plikow vue/js wszystkie pliki .json i ładuj je oddzielnie jako konfiguracje z foldera konfgiruacji, udokumentuj refaktoryzacje, 

find /home/tom/github/zlecenia/c201001.mask.services/js/components -name "*.js" -exec wc -l {} + | sort -nr



kontynuuj i sprawdz czy wszystkie komponenty vue sa dostepne z menu,. czy kazdy komponent mozna zoabczyc w przegladarce poprzez klikniecie menu

i zrob edytor tych plikow json




zrob refaktoryzacje index.html, oraz plików z js/modules, gdzie sa rozne implementecja, ktore masz azaadoptować do vue jako komponenty i użyć w plaikacji index.html,
podziel pliki z kodem gdzie ilosc linii kodu przekracza 500 linii na mniejsze pliki, reuzywalne  komponenty vue.
udokumentuj refaktoryzacje, zaktualizuj plik test.js do aktualnej struktury i specyfiki, dodaj wiecej nowych testow, usun niektualne po reffaktoryzacji z vue

popraw wygląd zawartości w klasie .menu-content, aby był kompaktowy i rozłożony na szerokość, ponieważ maksymalna wysokość panelu to 30% szerokości ekranu,
jeśli zawartośc zawiera więcej to robzij menu na kilka i pokaż je w bocznej lewewej kolumnie pod ostatnimi button items w menu 
podziel komponenty vue, ktore maja wiecej niz 500linii kodu na mniejsze, reuzwalne komplementarne, komponenty, aby nie bylo duplikatow

 


usun podstrone ładowania z "Witamy  MASKTRONIC System starting in Progress..." po zalogowaniu i przechodz od razu do menu po zalogowaniu
Zamiast tworzyc nowe menu, rozszerza aktualne menu np. dla " Login as operator" pod #login-operator-btn pokaż menu, ktore normalnie ladowalo sie od nowa,  


<div class="menu-layout">
 <div class="menu-sidebar" id="user-menu-items">            
 <div id="session-info" class="session-info">
 <button onclick="logout()" class="btn-logout" data-i18n="menu.logout">Logout</button>
</div>

<div class="menu-item" onclick="window.MenuManager.selectMenuOption('test_wizard')">
 <span class="menu-icon">🧙</span>
 <span class="menu-label">Test Wizard</span>
</div>
podobnie zrob dla innych ADMIN, SERVICEUSER, SUPERUSER


po zalogowaniu dwa pierwsze items button menu #login-scanner-btn  i  #login-keyword-btn  maja zniknac a pojawic sie Logout jako nowy button na saemym dole kolumny menu

podmenu np. #operator-menu pojawiac sie ma dopiero po zalogowaniu i rozsuwaj w formie harkonijki a nie popup
podobnie zrob dla innych ADMIN, SERVICEUSER, SUPERUSER



zmiana domeny bez c samo ID

w js/vue-sensor-monitoring.js znajdz wszystkeiz mienne i je zdefiniuj na poczatku w konfiguracji modułu
wydorebnij interwał generowania danych i ustaw na 100ms


przenalizuj wszystkie pliki modułów i dodaj do nich tłumaczenia z plików z  folderu    locales/*.json
uzupełnij pliki o nowe zmienne
każdy plik modułu Vue powinienien mieć zmienne dotyczace danych zadeklarowane na początku pliku oraz stałe odnośnie tłumaczeń pobierane z plików  tłumaczenia w zależności od wybranej lokalizacji z locales/*.json


dlaczego data i czas nie pokazuje sie w vue http://localhost:8081/index.html #time-info


dodaj takie testy, ktore wykażą, że to co aktualnie zostało zaimplementowane nie działa poporawnie, wykrywaj gdypo akcjach, np kliknieciu poajwia sie brak widoku, jak aktualnie i pokazuj wiecej logow, aby dociec dlaczego zmiana w trakcie akcji doprowadzila do usuneicia a nie do aktualizacji widoku z jednym z wczesniej zbudowanych dwidokow, biale tlo jest errorerm , wykrywaj tego typu bledy w trakcie dzialnia aplikacji i notyfikuj w logach jako error

Doda


