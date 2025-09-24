Podziel widok strony na 5 stron:
strona logowania index.html
strona usera: user-menu-screen.html
strona admina: admin-menu-screen.html
strona serviceusera: service-menu-screen.html
strona operatora: operator-menu-screen.html

Jak działa system ról, interface, uprawnień?

każdy profil użytkownika ma username i password wpisywane w pola przy logowaniu lub używając skanera

Każdy utworzony użytkownik otrzymuje przy utworzeniu konta dostep do wybranych systemowych ról:
operator
superuser
admin
serviceuser

w zależności od wybranego użytkownika, wyświetlane są różne menu i funkcje.
każda z tych rół ma określony komplementarny (niewspółdzielony z innymi rolami) zakres funkcji

Aby spersonalziować w zależności od użytkownika dostęp do ról trzeba określić zakres uprawnień w ramach przyznanych ról
jeśli rola otrzymana był operator+admin, to żeby ograniczyć dostęp do niektórych funkcji/widoków admina trzeba dodać ograniczenia dostępu

Dodatkowym ograniczeniem jest interfejs używany do przeglądania.
Jeśli użytkownik korzysta z interfejsu urządzenia z wyświetlaczem 7.9" to otrzymuje dostep do ograniczonego zestawu funkcji 
wysokosc ekranu ma 30% szerokosci, dlatego zoptymalizuj wyswietlanie, by
wszystko co da sie wyswietlic bylo mozliwe w takich prooprcjach na ekranie LCD IPS 7.9" z ekranem dotykowym o Rozdzielczości 400x1280 pikseli. 

W przypadku do podleczenia do komputera otrzymuje pelen zakres z ograniczeniami dostepu

Reasumując przyznane role definiują maksymalna ilosc funkcji do jakich ma dostep użytkownik,
w zależnosci czy to interfejs LCD czy przeglądarka komputera wyswietla się ograniczona lub cała lista funkcji
w zależności od ograniczenia roli wyswietla sie cala lista fuunkcji przyznaje do roli, lub częściowa lista, ograniczona zaznaczonymi wykluczeniami funkcji w ramach roli systemowej 

