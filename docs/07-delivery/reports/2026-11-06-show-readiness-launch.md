---
id: DOC-DEL-SHOW-LAUNCH
title: Готовность запуска к показу
type: delivery
status: draft
version: 0.1.0
created: 2026-11-06
updated: 2026-11-06
owner: docs-engineering
related: DOC-OPS-002
---

# Готовность запуска к показу

Кратко: зафиксирован факт, что локальный стек по процедуре из `docs/10-operations/local-dev-and-demo.md` поднимается; так как порт по умолчанию **3080** уже был занят рабочим стеком, дополнительно поднят **изолированный** проект Compose с отдельным именем и портом **3091** на loopback. Стек `docker-compose.server.yml` (LAN) **не** запускался.

## Контекст и ограничения

- **Доступ с другой машины:** среди запущенных контейнеров не обнаружено публикации на `0.0.0.0:8080` (типичный порт server compose). Отдельного адреса для удалённого доступа к server stack **нет** (см. также `docker ps` на момент проверки).
- **Loopback:** прокси изолированного стека слушает **только** `127.0.0.1:3091->80/tcp` — доступ с других хостов по сети не предполагается.
- Секреты из `.env.local` в отчёт **не** включались.

## Исходное состояние (порт 3080)

Перед запуском второго стека выполнена проверка главной страницы на порту по умолчанию:

```bash
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 5 http://127.0.0.1:3080/
```

**Результат:** HTTP **200** — стек на **3080** уже был поднят; он **не** останавливался и **не** пересоздавался (использован отдельный проект Compose).

Дополнительно зафиксированы запущенные контейнеры (фрагмент):

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
```

Среди прочего: `pharma-demo-proxy-1` с привязкой `127.0.0.1:3080->80/tcp`.

## Изолированный стек (второй compose project)

Проверка свободности **3091** (короткий запрос и просмотр `ss` — порт не слушался).

Запуск из каталога корня репозитория `pharma-demo` с переопределением переменных окружения **поверх** `--env-file .env.local` (имя проекта **не** `pharma-demo`, чтобы не заменить работающий стек):

```bash
HOST_PORT=3091 WEB_ORIGIN=http://127.0.0.1:3091 PUBLIC_ORIGIN=http://127.0.0.1:3091 DOCUSAURUS_URL=http://127.0.0.1:3091 docker compose -p pharma-demo-show --env-file .env.local -f docker-compose.dev.yml up --build -d
```

Ожидание готовности прокси (опрос до HTTP 200, фактически ответ появился на 3-й попытке с интервалом 3 с):

```bash
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 5 http://127.0.0.1:3091/ 2>/dev/null || echo "000")
  echo "try $i: $code"
  [ "$code" = "200" ] && break
  sleep 3
done
```

**Фактический URL показа:** http://127.0.0.1:3091/

После старта изолированного стека:

```bash
docker ps --filter name=pharma-demo-show --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
```

`pharma-demo-show-proxy-1`: `127.0.0.1:3091->80/tcp`.

Проверка наличия server stack на **8080** среди запущенных контейнеров:

```bash
docker ps --format '{{.Names}} {{.Ports}}' | grep -E '8080->|:8080' || echo 'NO_8080_MAPPING'
```

**Результат:** строк с публикацией **8080** нет (`NO_8080_MAPPING`).

## Проверки готовности (изолированный стек, порт 3091)

### 1. Главная страница `GET /`

```bash
curl -s --connect-timeout 5 --max-time 15 http://127.0.0.1:3091/ | head -c 8000
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 5 http://127.0.0.1:3091/
```

- **HTTP:** 200  
- **Признак готовности:** в HTML присутствует `<title>Pharma Demo — Demo v1</title>` и текст навигации «Pharma Demo».

### 2. Здоровье API `GET /backend/health`

```bash
curl -s -w "\nHTTP:%{http_code}\n" --connect-timeout 5 --max-time 15 http://127.0.0.1:3091/backend/health
```

- **HTTP:** 200  
- **Тело (без секретов):** `{"status":"ok","service":"ppc-api"}`

### 3. Раздел расписания `GET /schedule`

```bash
curl -s --connect-timeout 5 --max-time 15 http://127.0.0.1:3091/schedule | head -c 12000
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 5 http://127.0.0.1:3091/schedule
```

- **HTTP:** 200  
- **Признак:** в разметке есть «Календарный план» (навигация и breadcrumb).

### 4. Документация `GET /docs/`

```bash
curl -s -o /dev/null -w "HTTP:%{http_code}\n" --connect-timeout 5 --max-time 15 http://127.0.0.1:3091/docs/
```

- **HTTP:** 200

## Прогон маршрута

2026-11-06, сборка `pharma-demo-show`, адрес `http://127.0.0.1:3091`, по [director-rehearsal.md](../director-rehearsal.md) 0.3.0.

Свежая сессия: снимок A. Дальше C без программы, страница «Строительство», на D карточка AN-08 с Лебедевой, возврат на программу и «Дашборд» без смены буквы снимка, затем F. На F видны «Управленческие решения», три «Решение записано», Соколов Андрей Викторович и запуск `06.10.2027` (+21). Кнопка снимка при этом подписана «Управленческие меры»; письмо это уже оговаривает. Дефекта маршрута нет. E02 не закрыт.
