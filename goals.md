Poniżej przedstawiam kompletny przykład, jak **nowy projekt `1001.mask.services`** może wyglądać po migracji starych modułów i wygenerowaniu trzech nowych modułów z promptów (`pageTemplate`, `mainMenu`, `loginForm`). Pokazuję strukturę katalogów, przykładowe pliki i ich zawartość.


Aktualna Struktura nowego projektu

```
1001.mask.services/
├── CNAME
├── config
│   ├── app
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── app.json
│   ├── menu
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── menu.json
│   ├── project_structure.md
│   ├── README.md
│   ├── router
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── router.json
│   ├── routing.json
│   ├── schema_integration_example.js
│   ├── sensors.json
│   ├── system
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── system.json
│   ├── test-scenarios
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── test-scenarios.json
│   ├── workshop
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   └── workshop.json
├── css
│   ├── lcd-optimization.css
│   ├── style.css
│   └── vue.css
├── dist
│   ├── assets
│   │   ├── index-b505be6d.css
│   │   ├── main-9ee5c8fd.js
│   │   └── main-9ee5c8fd.js.map
│   └── index.html
├── docs
│   ├── device-data-modules.md
│   ├── README.md
│   ├── ROLE-ACCESS-SYSTEM.md
│   └── VUE_MIGRATION_DOCUMENTATION.md
├── favicon.ico
├── index.html
├── js
│   ├── FeatureRegistry.js
│   ├── features
│   │   ├── loginForm
│   │   │   └── v1
│   │   │       ├── index.js
│   │   │       ├── loginForm.js
│   │   │       ├── loginForm.test.js
│   │   │       └── package.json
│   │   ├── mainMenu
│   │   │   └── v1
│   │   │       ├── index.js
│   │   │       ├── mainMenu.js
│   │   │       ├── mainMenu.test.js
│   │   │       └── package.json
│   │   └── pageTemplate
│   │       └── v1
│   │           ├── index.js
│   │           ├── package.json
│   │           ├── pageTemplate.js
│   │           └── pageTemplate.test.js
│   ├── main.js
│   ├── moduleManagerWithPackageJson.js
│   ├── registerAllModulesBrowser.js
│   ├── registerAllModules.js
│   └── test-setup.js
├── locales
│   ├── de.json
│   ├── en.json
│   └── pl.json
├── node_modules
├── package.json
├── package-lock.json
├── README.md
├── scripts
├── test-results.json
├── todo.md
├── vite.config.js
└── vitest.config.js
```

---

# 📄 Przykładowe pliki nowych modułów

### 1. `pageTemplate/v1/package.json`

```json
{
  "name": "pageTemplate",
  "version": "1.0.0",
  "description": "Bazowy template strony",
  "main": "index.js",
  "scripts": {
    "test": "vitest run pageTemplate.spec.js"
  },
  "dependencies": {},
  "moduleMetadata": {
    "contracts": [],
    "rollbackConditions": {
      "errorRate": ">5%",
      "testFailures": ">0"
    }
  }
}
```

### 2. `pageTemplate/v1/index.js`

```javascript
import Component from './pageTemplate.vue';

export default {
  Component,
  handle(request) {
    // TODO: implement handle logic for pageTemplate@v1
    return { status: 200, message: 'pageTemplate@v1 executed' };
  }
};
```

### 3. `pageTemplate/v1/pageTemplate.vue`

```vue
<template>
  <div class="pageTemplate-component">
    <!-- Bazowy template strony -->
  </div>
</template>

<script setup></script>

<style scoped>
.pageTemplate-component { padding: 10px; }
</style>
```

### 4. `pageTemplate/v1/README.md`

```
# pageTemplate v1
Bazowy template strony

Usage: import module from './index.js'
```

### 5. `pageTemplate/v1/TODO.md`

```
# pageTemplate v1 TODO
- Implement handle() logic
- Add unit tests
- Integrate with other modules
```

### 6. `pageTemplate/v1/pageTemplate.spec.js`

```javascript
import module from './index.js';
test('pageTemplate handle', () => expect(module.handle({}).status).toBe(200));
```

---

### Analogicznie wyglądają moduły `mainMenu` i `loginForm`.

* Każdy ma własny folder `v1/` z `.vue`, `index.js`, `package.json`, `README.md`, `TODO.md`, `.spec.js`
* W FeatureRegistry rejestrujemy wszystkie wersje (stare i nowe)

---

# 📄 `README.md` projektu

```
# 1001.mask.services

Projekt modułowy Vue/Node.js z FeatureRegistry i automatycznym wersjonowaniem.

Moduły w projekcie:
- existingModule1@v1, v2
- pageTemplate@v1
- mainMenu@v1
- loginForm@v1
```

---

# 📄 `TODO.md` projektu

```
# TODO dla projektu

- Zintegruj moduły pageTemplate, mainMenu, loginForm w aplikacji
- Uruchom testy jednostkowe wszystkich modułów
- Skonfiguruj routing Vue dla nowych modułów
- Dodaj dokumentację dla każdego modułu
```

---

# 8️⃣ Jak używać w projekcie

```javascript
import { registerExistingModules } from './js/registerAllModules.js';
import { registry } from './js/FeatureRegistry.js';

registerExistingModules();

// Ładowanie najnowszej wersji modułu
const pageModule = await registry.load('pageTemplate', 'latest');
console.log(pageModule.handle({}));

// Dodawanie nowego modułu ręcznie
import { addModuleWithPrompt } from './js/moduleManagerWithPackageJson.js';
await addModuleWithPrompt('settingsPanel', 'Panel ustawień użytkownika');
```

---




```bash
cd 1001.mask.services
mkdir -p js/features
mkdir config css docs locales scripts
touch README.md TODO.md
npm init -y
npm install vitest vue
```

* `js/features` → wszystkie moduły w wersjach `vX`
* `config`, `css`, `docs`, `locales`, `scripts` → zgodnie ze starym projektem
* `README.md` i `TODO.md` → centralna dokumentacja

---

# 2️⃣ Skopiuj moduły ze starego projektu

Załóżmy, że stary projekt jest w `../c201001.mask.services`:

```bash
cp -r ../c201001.mask.services/js/features/* ./js/features/
```

* Każdy moduł w starym folderze zostanie przeniesiony z zachowaniem wersji (`v1`, `v2` itd.)
* Nie nadpisuje nowego projektu – jeśli pojawią się konflikty, możesz je rozwiązać manualnie
* Każdy moduł będzie rejestrowany w `FeatureRegistry`
* Można ładować dowolną wersję (`v1`, `v2`) lub najnowszą (`latest`)

---

# 4️⃣ Skopiuj moduły do rejestru


* Automatycznie przegląda wszystkie moduły w `js/features`
* Rejestruje wszystkie wersje w `FeatureRegistry`

---

# 5️⃣ Przygotuj managera modułów (z promptem i package.json)

Używamy skryptu, który podałem wcześniej (`moduleManagerWithPackageJson.js`)

* Pozwala ręcznie podać prompt
* Generuje nowy moduł w folderze `js/features/<Module>/vX`
* Tworzy `package.json`, `.vue`, `.spec.js`, `README.md`, `TODO.md`
* Rejestruje moduł i uruchamia testy

---

# 6️⃣ Workflow krok po kroku

1. Skopiuj stare moduły:

```bash
cp -r ../c201001.mask.services/js/features/* ./js/features/
```

2. Zarejestruj je w rejestrze:

```javascript
import { registerExistingModules } from './js/registerAllModules.js';
registerExistingModules();
```

3. Dodaj nowy moduł ręcznie za pomocą promptu:

```javascript
import { addModuleWithPrompt } from './js/moduleManagerWithPackageJson.js';

await addModuleWithPrompt('loginForm', 'Formularz logowania z walidacją');
```

* Skrypt tworzy folder `vX` z numerem nowej wersji
* Generuje wszystkie pliki (`.vue`, `index.js`, `package.json`, `README.md`, `TODO.md`)
* Rejestruje moduł w rejestrze
* Uruchamia testy
* W razie problemu usuwa nową wersję (rollback)

4. Używaj modułów w kodzie Vue:

```javascript
import { registry } from './js/FeatureRegistry.js';

const loginModule = await registry.load('loginForm', 'latest');
console.log(loginModule.handle({}));
```

---

# 7️⃣ Zalety

* Automatyczne **wersjonowanie modułów**
* **Rollback** przy nieudanych testach
* Łatwe **dodawanie nowych modułów** z promptu
* Możliwość korzystania z **starych modułów**
* Centralny **FeatureRegistry** do ładowania wszystkich wersji






**pełny skrypt Node.js**, który automatycznie:

* Tworzy strukturę modułu w `js/features/<ModuleName>/vX/`
* Generuje pliki szkieletowe: `.vue`, `index.js`, `.spec.js`, `README.md`, `TODO.md`
* Generuje `package.json` jako manifest modułu z wersjonowaniem i metadata
* Rejestruje moduł w `FeatureRegistry`
* Uruchamia testy jednostkowe i integracyjne
* Wycofuje moduł, jeśli testy nie przejdą
* Aktualizuje projektowy `README.md`

# 🔧 Jak używać

```javascript
import { addModuleWithPrompt } from './moduleManagerWithPackageJson.js';

await addModuleWithPrompt('loginForm', 'Formularz logowania z walidacją');
await addModuleWithPrompt('mainMenu', 'Główne menu aplikacji');
await addModuleWithPrompt('pageTemplate', 'Bazowy template strony');
```

* Skrypt automatycznie tworzy **vX**, generuje wszystkie pliki i `package.json`
* Rejestruje moduł w **FeatureRegistry**
* Uruchamia testy (`vitest`)
* W przypadku niepowodzenia wykonuje rollback
* Aktualizuje projektowy `README.md`



Zmigruj projekt c201001.mask.services do `1001.mask.services`:

* Kopiuj stare moduły  do nowej lokalizacji wedle ustalonego schematu
* Rejestruj je w FeatureRegistry
* Twórz brakujące `package.json` dla starych modułów
* Twórz foldery dla nowych modułów gotowe do generowania z promptu.

✅ **Efekt:**

* Projekt ma wszystkie stare moduły skopiowane i zarejestrowane
* Trzy nowe moduły są już gotowe w strukturze `v1`
* Wszystkie moduły mają `package.json`, README i TODO
* Testy jednostkowe można uruchamiać od razu (`vitest`)
* Każdy moduł można rozwinąć w nowej wersji (`v2`, `v3`) i FeatureRegistry pozwala rollback



# Kluczowe usprawnienia

Semantic Versioning (SemVer): moduły wersjonowane jako MAJOR.MINOR.PATCH

Conventional Commits & CHANGELOG: automatyczne generowanie changelog

OpenAPI/JSON Schema: kontrakty API i walidacja danych

Linting & Formatting: ESLint, Prettier, Stylelint, EditorConfig

CI/CD: GitHub Actions – lint, testy, coverage, audit, release

Dependency Management: Dependabot, npm audit

Prompt Registry & Governance: wersjonowane prompt’y z testami referencyjnymi

Dokumentacja: VuePress dla modułów, szablon PR, szablon code review


# Ocena rozwiązania i rekomendowane standardy

**Główne wnioski:**  
Proponowana architektura modułowa z FeatureRegistry, automatycznym wersjonowaniem oraz metadanymi w `package.json` stanowi solidną podstawę do zarządzania rozwojem przy wsparciu LLM. Aby jednak w pełni spełnić oczekiwania dużych zespołów i zapewnić kontrolę nad generowanym kodem, warto uzupełnić ją o uznane standardy i dobre praktyki.

***

## Silne wersjonowanie i semantyka

Rozwiązanie wykorzystuje wersje w katalogach `vX` i metadane w `package.json`, ale dla spójności zaleca się:

- **Semantic Versioning (SemVer)** – stosować schemat MAJOR.MINOR.PATCH, np. `1.2.3`, zamiast `v1` i `1.0.0`. Ułatwia to automatyzację publikacji i dowolne narzędzia typu semantic-release.
- **Conventional Commits** – narzucenie formatu commitów (feat, fix, chore itp.) pozwala generować changelogi i wyzwalać release’y automatycznie.
- **Changelog.md** – w pliku `CHANGELOG.md` dokumentować zmiany według wzorca Keep a Changelog.

***

## Definicja kontraktów i walidacja

Aby LLM generował zgodny kod i module spełniały wymagania:

- **OpenAPI/JSON Schema** – definiować kontrakty API, modele danych i walidować wejście/wyjście modułów.
- **Interface Definition Language (IDL)** – np. GraphQL SDL lub Protocol Buffers dla silnej weryfikacji wersji i migracji.
- **Design by Contract** – w metadatach `contracts` określać pre- i post-warunki, a testy generować na ich podstawie.

***

## Jakość kodu i styl

Zapewnienie spójnego stylu przy automatycznej generacji:

- **ESLint + Prettier** – wymusić jednolitą formę kodu JavaScript/Vue.
- **Stylelint** – do plików `.vue` i `.css`.
- **Airbnb JavaScript Style Guide** – lub inny well-known style guide.
- **EditorConfig** – konsystencja w tabulacji i znakach końca linii.

***

## Testy i ciągła integracja

Obecne testy Vitest to dobry początek, ale warto:

- **Coverage** – wymuszać minimalny poziom pokrycia testami (np. 80%).
- **CI/CD** – GitHub Actions lub GitLab CI do:
  - uruchamiania lint, testów i budowy pakietów,
  - automatycznego bumpowania wersji po merge’u,
  - publikowania artefaktów (npm, Docker Registry).
- **Contract Testing** – Pact lub inne narzędzia do testowania interfejsów między modułami.

***

## Bezpieczeństwo i zależności

Moduły generowane przez LLM mogą zawierać niechciane zależności:

- **Dependency Scanning** – Snyk, OWASP Dependency-Check, npm audit w CI.
- **Lockfile Maintenance** – np. Renovate Bot lub Dependabot do automatycznych PR z aktualizacjami zależności.
- **Policy Compliance** – narzędzia typu OpenSSF Scorecard.

***

## Architektura i zasady SOLID

Aby moduły były skalowalne i łatwe do utrzymania:

- **Single Responsibility Principle (SRP)** – każdy moduł ma jedną odpowiedzialność.
- **Open/Closed Principle** – rozszerzalność przez wersjonowanie i rejestrację, bez modyfikacji starych modułów.
- **Interface Segregation** – rozdział kontraktów na małe, wyspecjalizowane interfejsy.
- **Dependency Injection** – ułatwia testowanie i mockowanie zależności.

***

## Dokumentacja i proces przeglądu

Wygenerowane `README.md` i `TODO.md` to dobry start, ale:

- **Docsite** – narzędzia takie jak VuePress lub Storybook do prezentacji komponentów i API modułów.
- **Pull Request Template** – checklista: lint, testy, dokumentacja, migracje.
- **Code Review** – obowiązkowy proces przeglądu generowanego kodu, aby wychwycić błędy LLM.

***

### Podsumowanie

Proponowane rozwiązanie już:

- stosuje modularność,
- umożliwia rollback i automatyzację testów,
- zarządza wersjami.

Aby wzmocnić kontrolę i standaryzację przy wsparciu LLM, warto wprowadzić semantyczne wersjonowanie, konwencje commitów, definiowane kontrakty (OpenAPI/JSON Schema), rygorystyczne testy i CI/CD, polityki bezpieczeństwa oraz procesy code review i dokumentację online. Te elementy stworzą dojrzały workflow, który zapewni spójność, jakość i skalowalność rozwoju modułów generowanych przez LLM.



# Dokumentacja Systemu MASKSERVICE C20 1001 v3.0

## 1. ARCHITEKTURA SYSTEMU

### 1.1 Przegląd Architektury
```
┌─────────────────────────────────────────────────────────────┐
│                     WARSTWA PREZENTACJI                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │   Vue 3  │ │  Router  │ │   Vuex   │ │ Vue I18n     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      WARSTWA LOGIKI                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │   Auth   │ │ Sensors  │ │  Tests   │ │   Reports    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        WARSTWA API                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │Flask REST│ │WebSocket │ │Validation│ │Export Service│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     WARSTWA DANYCH                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │JSON Config│ │XML Schema│ │CSV Export│ │PDF Generation│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Komponenty Systemu

#### Frontend (Vue 3)
- **Rozmiar ekranu**: 7.9" LCD IPS, rozdzielczość 400x1280px (landscape)
- **Framework**: Vue 3.4 z Composition API
- **Routing**: Vue Router 4 z hash-based navigation
- **Stan**: Vuex 4 dla globalnego stanu aplikacji
- **Lokalizacja**: Vue I18n 9 (PL/EN/DE)

#### Backend (Python Flask)
- **API**: RESTful endpoints z Flask
- **WebSocket**: Socket.IO dla real-time updates
- **Walidacja**: JSON Schema validation
- **Export**: PDF (ReportLab), CSV, JSON, XML


## 2. SPECYFIKACJA INTERFEJSU UŻYTKOWNIKA

### 2.1 Layout Główny
```
┌──────────────────────────────────────────────────────────────┐
│                      HEADER (40px)                           │
│  Logo | Status połączenia | Informacje o urządzeniu          │
├────────────────┬─────────────────────────────────────────────┤
│                │                                             │
│   SIDEBAR      │            CONTENT AREA                     │
│   (180px)      │                                             │
│                │  ┌─────────────────────────────────┐       │
│  ┌──────────┐  │  │    PRESSURE PANEL (100px)      │       │
│  │Menu Item │  │  │  Low │ Medium │ High            │       │
│  │Menu Item │  │  └─────────────────────────────────┘       │
│  │Menu Item │  │                                             │
│  │Menu Item │  │  ┌─────────────────────────────────┐       │
│  │Menu Item │  │  │    MAIN CONTENT                 │       │
│  └──────────┘  │  │    (Dynamic based on menu)     │       │
│                │  └─────────────────────────────────┘       │
│                │                                             │
├────────────────┴─────────────────────────────────────────────┤
│                      FOOTER (30px)                           │
│  User info | Language selector | Date/Time | Logout          │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Kryteria Wyglądu

#### A. Header (Górna belka)
- **Wysokość**: 40px
- **Tło**: #2c3e50 (ciemny niebieski)
- **Elementy**:
  - Logo MASKSERVICE (lewy róg)
  - Status połączenia (środek)
  - Informacje o urządzeniu (prawy róg)
- **Czcionka**: 13px, biała

#### B. Sidebar (Lewa kolumna menu)
- **Szerokość**: 180px
- **Tło**: białe
- **Border**: 1px solid #ddd (prawa krawędź)
- **Menu items**:
  - Padding: 8px
  - Font-size: 11px
  - Hover: tło #f0f0f0
  - Active: tło #3498db, biały tekst
  - Ikona + tekst w jednej linii

#### C. Content Area (Główna przestrzeń)
- **Tło**: #fafafa
- **Padding**: 4px
- **Zawartość**:
  - Panel ciśnienia (gdy wymagany)
  - Dynamiczna zawartość zależna od menu

#### D. Pressure Panel (Prawa kolumna - czujniki)
- **Położenie**: Górna część content area
- **Layout**: Poziomy (3 kolumny)
- **Każdy element**:
  - Label (10px, bold)
  - Value (18px, bold)
  - Unit (9px)
  - Mini wykres (40px wysokości)

#### E. Footer (Dolna belka)
- **Wysokość**: 30px
- **Tło**: #2c3e50
- **Elementy**:
  - Info o użytkowniku (lewy)
  - Wybór języka (środek)
  - Data/czas (prawy)
- **Czcionka**: 10px, biała

### 2.3 Responsywność dla 7.9" (400x1280px)
- **Orientacja**: Landscape (pozioma)
- **Proporcje**: 30% wysokości do szerokości
- **Optymalizacje**:
  - Minimalne paddingi (4px)
  - Kompaktowe fonty (10-11px base)
  - Poziome układy dla lepszego wykorzystania szerokości
  - Scrollowanie tylko w content area

## 3. MODUŁY FUNKCJONALNE

### 3.1 Moduł Autoryzacji
```javascript
// Struktura użytkownika
User {
  username: String,
  role: 'OPERATOR' | 'ADMIN' | 'SUPERUSER' | 'SERWISANT',
  password: String (min. 3 znaki),
  lastLogin: DateTime,
  permissions: Array<String>
}
```

#### Role i uprawnienia:
- **OPERATOR**: Testy i raporty (2 opcje menu)
- **ADMIN**: Zarządzanie użytkownikami + podstawowe funkcje (4 opcje)
- **SUPERUSER**: Pełna kontrola systemu (4 opcje zaawansowane)
- **SERWISANT**: Serwis, diagnostyka, warsztaty (5 opcji technicznych)

### 3.2 Moduł Testów
```javascript
TestScenario {
  id: String,
  name: String,
  deviceType: String,
  interval: '6_months' | '12_months' | '24_months',
  steps: Array<TestStep>,
  parameters: Object,
  normReference: 'PN-EN 136' | 'PN-EN 137'
}

TestStep {
  id: Number,
  name: String,
  type: 'manual' | 'auto' | 'test',
  duration: Number, // seconds
  expectedValue: Number,
  tolerance: Number
}
```

### 3.3 Moduł Sensorów
```javascript
SensorData {
  pressure: {
    low: { value: Number, unit: 'mbar', history: Array<Number> },
    medium: { value: Number, unit: 'bar', history: Array<Number> },
    high: { value: Number, unit: 'bar', history: Array<Number> }
  },
  temperature: Number, // °C
  humidity: Number, // %
  flowRate: Number, // L/min
  timestamp: DateTime
}
```

### 3.4 Moduł Raportów
```javascript
Report {
  id: String,
  date: DateTime,
  deviceId: String,
  testScenarioId: String,
  results: Array<TestResult>,
  status: 'PASS' | 'FAIL' | 'PARTIAL',
  operator: String,
  exportFormats: ['PDF', 'CSV', 'JSON', 'XML']
}
```

## 4. LISTA ZADAŃ TODO - WERYFIKACJA PRZEZ LLM

### 4.1 Testy Układu UI
```javascript
// Test 1: Sprawdzenie struktury layoutu
describe('UI Layout Tests', () => {
  test('Header should be 40px height', () => {
    const header = document.querySelector('.header');
    expect(header.offsetHeight).toBe(40);
  });
  
  test('Sidebar should be 180px width', () => {
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar.offsetWidth).toBe(180);
  });
  
  test('Footer should be 30px height', () => {
    const footer = document.querySelector('.footer');
    expect(footer.offsetHeight).toBe(30);
  });
  
  test('Content area should fill remaining space', () => {
    const content = document.querySelector('.content');
    const expectedHeight = window.innerHeight - 40 - 30;
    expect(content.offsetHeight).toBe(expectedHeight);
  });
});
```

### 4.2 Testy Funkcjonalności
```javascript
// Test 2: Weryfikacja systemu autoryzacji
describe('Authentication Tests', () => {
  test('Password must be minimum 3 characters', async () => {
    const result = await login('OPERATOR', '12');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Password too short');
  });
  
  test('Each role has unique menu items', () => {
    const menuConfig = getMenuConfig();
    const operatorMenu = menuConfig.OPERATOR;
    const adminMenu = menuConfig.ADMIN;
    
    expect(operatorMenu.length).toBe(2); // Only test and reports
    expect(adminMenu.length).toBe(4); // More options
    
    // Check no duplicate primary functions across roles
    const operatorKeys = operatorMenu.map(m => m.key);
    const serwisantKeys = menuConfig.SERWISANT.map(m => m.key);
    
    const overlap = operatorKeys.filter(k => serwisantKeys.includes(k));
    expect(overlap.length).toBe(0); // No overlap in specialized functions
  });
});
```

### 4.3 Testy Lokalizacji
```javascript
// Test 3: Sprawdzenie tłumaczeń
describe('Localization Tests', () => {
  test('All UI elements have translations', () => {
    const languages = ['pl', 'en', 'de'];
    const requiredKeys = [
      'common.logout',
      'menu.testMenu',
      'pressure.low',
      'pressure.medium',
      'pressure.high'
    ];
    
    languages.forEach(lang => {
      const translations = loadTranslations(lang);
      requiredKeys.forEach(key => {
        expect(getNestedValue(translations, key)).toBeDefined();
      });
    });
  });
  
  test('Language switch updates all visible text', async () => {
    await changeLanguage('en');
    expect(document.querySelector('.pressure-label').textContent).toBe('Low');
    
    await changeLanguage('pl');
    expect(document.querySelector('.pressure-label').textContent).toBe('Niskie');
  });
});
```

### 4.4 Testy Eksportu Danych
```javascript
// Test 4: Weryfikacja eksportu
describe('Export Tests', () => {
  test('Export to PDF generates valid file', async () => {
    const data = { test: 'data' };
    const pdf = await exportToPDF(data);
    
    expect(pdf).toBeInstanceOf(Blob);
    expect(pdf.type).toBe('application/pdf');
    expect(pdf.size).toBeGreaterThan(0);
  });
  
  test('CSV export includes all data fields', async () => {
    const data = [
      { id: 1, name: 'Test', value: 100 }
    ];
    const csv = await exportToCSV(data);
    
    expect(csv).toContain('id,name,value');
    expect(csv).toContain('1,Test,100');
  });
});
```

### 4.5 Testy Responsywności
```javascript
// Test 5: Sprawdzenie dla ekranu 7.9"
describe('Responsive Tests', () => {
  test('UI fits 400x1280px display', () => {
    window.resizeTo(1280, 400);
    
    const container = document.querySelector('#app');
    expect(container.scrollWidth).toBeLessThanOrEqual(1280);
    expect(container.scrollHeight).toBeLessThanOrEqual(400);
  });
  
  test('Virtual keyboard blocks native keyboard', () => {
    const input = document.querySelector('input[type="password"]');
    input.focus();
    
    // Check that input is readonly
    expect(input.hasAttribute('readonly')).toBe(true);
    
    // Check virtual keyboard is visible
    const vKeyboard = document.querySelector('.virtual-keyboard');
    expect(vKeyboard.classList.contains('active')).toBe(true);
  });
});
```

### 4.6 Testy Czujników Real-time
```javascript
// Test 6: Weryfikacja aktualizacji sensorów
describe('Sensor Tests', () => {
  test('Pressure updates every second', (done) => {
    const initialValue = getPressureValue('low');
    
    setTimeout(() => {
      const newValue = getPressureValue('low');
      expect(newValue).not.toBe(initialValue);
      done();
    }, 1100);
  });
  
  test('Chart displays last 60 measurements', () => {
    const chart = getChart('pressure-low');
    expect(chart.data.labels.length).toBe(60);
    expect(chart.data.datasets[0].data.length).toBe(60);
  });
});
```

## 5. CHECKLIST WERYFIKACJI SYSTEMU

### 5.1 Weryfikacja Struktury
- [ ] Header ma dokładnie 40px wysokości
- [ ] Footer ma dokładnie 30px wysokości
- [ ] Sidebar ma dokładnie 180px szerokości
- [ ] Content area wypełnia pozostałą przestrzeń
- [ ] Brak poziomego scrollowania przy 1280px szerokości
- [ ] Brak pionowego scrollowania poza content area

### 5.2 Weryfikacja Menu
- [ ] OPERATOR ma tylko 2 opcje menu (testy, raporty)
- [ ] ADMIN ma 4 opcje menu
- [ ] SUPERUSER ma 4 zaawansowane opcje
- [ ] SERWISANT ma 5 opcji technicznych
- [ ] Każda rola ma unikalne, niepokrywające się funkcje główne

### 5.3 Weryfikacja Lokalizacji
- [ ] Wszystkie teksty mają tłumaczenia w 3 językach
- [ ] Przełączanie języka działa dynamicznie
- [ ] Data i czas wyświetlają się w lokalnym formacie
- [ ] Brak hardkodowanych tekstów w kodzie

### 5.4 Weryfikacja Funkcjonalności
- [ ] Login wymaga min. 3 znaków hasła
- [ ] Logout przekierowuje do ekranu logowania
- [ ] Virtual keyboard blokuje systemową klawiaturę
- [ ] Eksport działa w 4 formatach (PDF/CSV/JSON/XML)
- [ ] Czujniki aktualizują się co sekundę
- [ ] Wykresy pokazują ostatnie 60 pomiarów

### 5.5 Weryfikacja Wydajności
- [ ] Ładowanie aplikacji < 3 sekundy
- [ ] Przełączanie menu < 100ms
- [ ] Aktualizacja sensorów bez lagów
- [ ] Eksport danych < 2 sekundy
- [ ] Brak wycieków pamięci przy długiej pracy

## 6. KONFIGURACJA PRODUKCYJNA

### 6.1 Zmienne środowiskowe
```bash
# .env.production
VUE_APP_API_URL=http://192.168.1.100:5000
VUE_APP_WS_URL=ws://192.168.1.100:5000
VUE_APP_UPDATE_INTERVAL=1000
VUE_APP_SESSION_TIMEOUT=1800000
VUE_APP_EXPORT_PATH=/exports
```

### 6.2 Nginx Configuration
```nginx
server {
    listen 80;
    server_name 1001.mask.services;
    
    location / {
        root /var/www/maskservice;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
    }
    
    location /socket.io {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 6.3 Deployment Checklist
- [ ] Build produkcyjny Vue (`npm run build`)
- [ ] Konfiguracja HTTPS/SSL
- [ ] Backup bazy konfiguracji
- [ ] Monitoring logów
- [ ] Automatyczne restarty przy błędach
- [ ] Scheduled backups (daily)

## 7. STANDARDY I NORMY

### 7.1 Zgodność z normami
- **PN-EN 136**: Respiratory protective devices - Full face masks
- **PN-EN 137**: Respiratory protective devices - Self-contained breathing apparatus
- **ISO 9001:2015**: Quality management systems

### 7.2 Standardy kodu
- Komponenty Vue max 400 linii
- Funkcje max 100 linii
- ESLint configuration strict
- 100% pokrycie testami krytycznych funkcji
- Dokumentacja JSDoc dla wszystkich funkcji publicznych
