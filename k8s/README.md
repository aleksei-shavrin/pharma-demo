# k3s deploy — pharma-demo

Namespace: `pharma`  
Host: `https://[demo-host]/`  
TLS: cert-manager `letsencrypt-prod` → Secret `pharma-demo-tls`  

Стек как в ADR-0005 / `docker-compose.server.yml`:

| Path | Service |
|------|---------|
| `/` | `pharma-demo-web` (Next) |
| `/backend/*` | `pharma-demo-api` (Nest, strip via Caddy) |
| `/portal/*` | `pharma-demo-docs` (Docusaurus, strip via Caddy) |

Публичный Ingress → `pharma-demo-proxy` (Caddy).

## Images

| Deployment | Image |
|------------|-------|
| web | `ghcr.io/example/pharma-demo/web:latest` |
| api | `ghcr.io/example/pharma-demo/api:latest` |
| docs | `ghcr.io/example/pharma-demo/docs:latest` |
| proxy | `caddy:2-alpine` |

В namespace `pharma` нужен pull-secret `dockerrebel`.

## Auth (form login)

API fail-closed без Secret `pharma-demo-api-auth` → `POST /backend/v1/auth/login` всегда `{"message":"Forbidden"}` (это **не** «неверный пароль»; wrong password даёт 303 на `/login?error=1`).

| Источник | Ключи |
|----------|--------|
| ConfigMap `pharma-demo-api` | `PUBLIC_ORIGIN`, `COOKIE_SECURE=true`, `WEB_ORIGIN`, … |
| Secret `pharma-demo-api-auth` | `LOGIN_USERNAME`, `LOGIN_PASSWORD_HASH`, `SESSION_SECRET` |
| Deployment `pharma-demo-web` | `API_INTERNAL_URL=http://pharma-demo-api:3000` (middleware session check; default `http://api:3000` is Compose-only) |

CI deploy вызывает `tools/k8s/apply-api-auth-secret.sh`. Demo default: username/password **`admin` / `admin`**. Override в GitLab CI/CD variables: `PHARMA_LOGIN_USERNAME`, `PHARMA_LOGIN_PASSWORD_HASH`, `PHARMA_SESSION_SECRET`.

Вручную:

```bash
bash tools/k8s/apply-api-auth-secret.sh
kubectl -n pharma rollout restart deployment/pharma-demo-api
```

## Apply

```bash
kubectl apply -k k8s
bash tools/k8s/apply-api-auth-secret.sh
kubectl -n pharma get pods,svc,ingress -l app.kubernetes.io/part-of=pharma-demo
```

Проверки:

```bash
curl -fsS https://[demo-host]/backend/health
curl -fsSI https://[demo-host]/portal/
curl -fsSI https://[demo-host]/
```

CI на `main` собирает три образа и делает `kubectl apply -k` + auth secret + rollout.
