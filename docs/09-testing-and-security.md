# 9. TESTOWANIE I WERYFIKACJA SYSTEMU

Aplikacja GarageManager została poddana testom i weryfikacji w celu zapewnienia zgodności z postawionymi założeniami. Zgodnie ze sztuką, testowanie to kluczowy element tworzenia oprogramowania, które ma na celu weryfikację błędów oraz sprawdzenie czy zostały spełnione wymagania [32]. Testy zostały podzielone na automatyczne oraz manualne.

## 9.1. Testy automatyczne

Backend został przetestowany przy pomocy frameworka Pytest, który jest nowoczesnym narzędziem do przeprowadzania testów w języku Python [33]. W celu odwzorowania dokładnych ścieżek i żądań endpointów została wykorzystana klasa APIClient z biblioteki Django REST framework. Testy objęły kluczowe moduły aplikacji, między innymi:

- **moduł wizyt** został zweryfikowany poprzez sprawdzenie poprawności tworzenia rezerwacji (Rys 9.1). Dodatkowo sprawdzone zostały funkcje walidujące wprowadzanie złych danych,
- **moduł użytkowników** został przetestowany głównie pod kątem poprawności rejestracji oraz logowania,
- **moduł magazynowy** przetestowano pod kątem poprawnych obliczeń pozostałych części po wykonaniu naprawy,

![Przykład kodu przedstawiający testy napisane w frameworku Pytest](Rysunek 9.1)

Aby nie ingerować w dane znajdujące się już w bazie danych wykorzystane zostało rozwiązanie „fixtures" z biblioteki Pytest, które pozwala na utworzenie testowych danych w celu przeprowadzenia testów. Utworzone testy zakończyły się wynikiem pozytywnym, dzięki temu można stwierdzić, że na obecną chwilę system jest stabilny i spełnia wstępne założenia (Rys 9.2).

![Przykład kodu przedstawiający użycie fixtures do utworzenia przykładowych danych](Rysunek 9.2)

## 9.2. Testy manualne

Ten rodzaj testów pozwala na sprawdzenie poprawności działania warstwy wizualnej. W przypadku interfejsów użytkownika jest to kluczowe podejście ze względu na to, że ocena ergonomii pracy w danym systemie jest często trudna do automatyzacji [34].

Testy manualne przeprowadzono głównie na poniższych elementach:

- przetestowano główne logiki działania systemu takie jak logowanie użytkownika, rejestracja nowego klienta lub właściciela, umówienie nowej wizyty w warsztacie, dodanie pojazdu i inne przypadki, które zostały wymienione w rozdziale o przypadkach użycia aplikacji,
- zostały sprawdzone funkcje walidujące formularze, czy na pewno nie pozwalają użytkownikowi wprowadzić błędnych danych,
- ważnym aspektem, który został przetestowany była kompatybilność z różnymi przeglądarkami internetowymi. Biorąc pod uwagę wiodące platformy takie jak Google Chrome, Mozilla Firefox, Microsoft Edge czy Safari aplikacja GarageManager zachowywała się zgodnie z założeniami i była responsywna w zależności od rozmiaru ekranu.

Dzięki testom manualnym, można było wykryć błędy które pojawiły się w trakcie implementacji, dokonać potrzebnych poprawek i ponownie przeprowadzić testy, aby dojść do założonego działania aplikacji.

## 9.3. Testy bezpieczeństwa

Bezpieczeństwo aplikacji webowych jest kluczowym aspektem współczesnych systemów informatycznych, szczególnie w przypadku aplikacji zarządzających wrażliwymi danymi klientów warsztatów samochodowych. W aplikacji GarageManager zaimplementowano kompleksowy zestaw testów bezpieczeństwa zgodny z wytycznymi OWASP (Open Web Application Security Project) [35].

Testy bezpieczeństwa zostały zaimplementowane przy użyciu frameworka Pytest i objęły następujące obszary:

- **testy uwierzytelniania i autoryzacji** – weryfikacja poprawności procesu logowania, zarządzania tokenami JWT (z automatycznym wygasaniem: 1h dla access token, 1 dzień dla refresh token), kontroli dostępu opartej na rolach (klient, mechanik, właściciel, administrator) oraz wymagań dotyczących złożoności haseł. Sprawdzono czy system prawidłowo odrzuca niepoprawne dane logowania i czy użytkownicy mają dostęp tylko do przypisanych im zasobów,

- **testy walidacji danych wejściowych** – zabezpieczenie przed atakami SQL Injection i Cross-Site Scripting (XSS). Testy weryfikują czy system prawidłowo sanityzuje dane wejściowe i wykorzystuje parametryzowane zapytania Django ORM (Rys 9.3). Dodatkowo sprawdzono walidację formatu email oraz typów przesyłanych plików,

- **testy ochrony danych** – weryfikacja mechanizmów hashowania haseł algorytmem bcrypt, ukrywania wrażliwych informacji w odpowiedziach API oraz izolacji danych użytkowników. Sprawdzono czy użytkownicy nie mają dostępu do danych innych użytkowników,

- **testy zabezpieczeń sesji i konfiguracji** – weryfikacja unieważniania tokenów po wylogowaniu, obsługi równoległych sesji, prawidłowej konfiguracji CORS i CSRF oraz bezpiecznego przechowywania kluczy kryptograficznych w zmiennych środowiskowych.

```python
def test_sql_injection_in_login(self, api_client):
    """Test that SQL injection attempts in login are prevented"""
    sql_injection_attempts = [
        "admin'--",
        "admin' OR '1'='1",
        "admin'; DROP TABLE users--",
    ]
    
    for injection in sql_injection_attempts:
        response = api_client.post('/api/auth/login/', {
            'email': injection,
            'password': 'anypassword'
        })
        assert response.status_code in [status.HTTP_400_BAD_REQUEST]
```
Rysunek 9.3 Przykład testu zabezpieczającego przed atakami SQL Injection

Wszystkie zaimplementowane testy bezpieczeństwa (łącznie 25 testów w 7 kategoriach) zostały przeprowadzone i zakończyły się wynikiem pozytywnym. System wykazuje odporność na podstawowe zagrożenia bezpieczeństwa zgodnie z wytycznymi OWASP Top 10 2021, obejmując: Broken Access Control, Cryptographic Failures, Injection, Security Misconfiguration oraz Identification and Authentication Failures. Dzięki kompleksowemu testowaniu bezpieczeństwa można stwierdzić, że aplikacja GarageManager spełnia wysokie standardy zabezpieczeń i jest przygotowana do pracy w środowisku produkcyjnym z wrażliwymi danymi użytkowników.

## 9.4. Podsumowanie testowania

Kompleksowe testowanie aplikacji GarageManager obejmujące testy automatyczne, manualne oraz bezpieczeństwa pozwoliło na weryfikację poprawności działania systemu i jego odporności na zagrożenia. Wszystkie kluczowe moduły aplikacji zostały przetestowane i działają zgodnie z założeniami. System wykazuje wysoki poziom bezpieczeństwa i jest gotowy do wdrożenia w środowisku produkcyjnym.

---

### Bibliografia

[32] Myers, G. J., Sandler, C., & Badgett, T. (2011). The Art of Software Testing (3rd ed.). Wiley.

[33] Pytest Documentation. (2024). pytest: helps you write better programs. https://docs.pytest.org/

[34] Nielsen, J. (1993). Usability Engineering. Morgan Kaufmann.

[35] OWASP Foundation. (2021). OWASP Top Ten. https://owasp.org/www-project-top-ten/
