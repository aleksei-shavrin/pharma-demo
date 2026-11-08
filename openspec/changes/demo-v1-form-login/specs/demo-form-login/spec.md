## ADDED Requirements

### Requirement: Demo single-user form login

Система SHALL предоставлять форму входа с полями логин/пароль, checkbox «Запомнить меня» (default unchecked) и кнопкой «Войти» для одного demo-пользователя с bcrypt hash на сервере.

#### Scenario: Wrong password shows generic error

- **WHEN** пользователь отправляет неверный пароль
- **THEN** система перенаправляет на `/login` с generic ошибкой без утечки существования учётки и без пароля в URL

#### Scenario: Correct password sets session cookie

- **WHEN** пользователь отправляет верные credentials
- **THEN** система устанавливает HttpOnly SameSite=Lax cookie и перенаправляет на safe internal return path

### Requirement: Remember-me cookie TTL

Unchecked remember SHALL использовать session cookie без Max-Age и server `expiresAt` 8h. Checked remember SHALL использовать Max-Age 2592000 и server `expiresAt` 30d. Secure SHALL выставляться только при HTTPS/`COOKIE_SECURE=true`.

#### Scenario: Session vs persistent cookie

- **WHEN** remember unchecked vs checked
- **THEN** Set-Cookie соответственно без Max-Age или с Max-Age=2592000

### Requirement: Page and API session gate

App pages (кроме `/login`) SHALL проверять сессию через Nest session verify (fail-closed если Nest недоступен). Narrative `/v1` data routes SHALL требовать валидную сессию и при отсутствии возвращать **401** (не HTML redirect). Public exceptions: login, logout POST, session GET, health, OpenAPI.

#### Scenario: Anonymous API data denied

- **WHEN** анонимный клиент запрашивает protected `/v1` resource
- **THEN** API отвечает 401

### Requirement: Logout POST

Logout SHALL быть POST-only с Origin check, идемпотентным clear cookie и redirect на `/login`. UI control — icon с aria-label/title «Выйти», крайний правый в header.

#### Scenario: Logout clears session

- **WHEN** пользователь нажимает «Выйти»
- **THEN** cookie очищается и последующий deep URL требует повторный вход

### Requirement: Safe return path

Return path SHALL допускать только same-host relative path+query; внешние URL, `//`, `/login` loop запрещены; Location кодируется безопасно для Unicode.

#### Scenario: External return rejected

- **WHEN** параметр `return` содержит `//evil` или абсолютный URL
- **THEN** система использует fallback `/` и не выполняет open redirect
