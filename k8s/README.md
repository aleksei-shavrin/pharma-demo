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

## Apply

```bash
kubectl apply -k k8s
kubectl -n pharma get pods,svc,ingress -l app.kubernetes.io/part-of=pharma-demo
```

Проверки:

```bash
curl -fsS https://[demo-host]/backend/health
curl -fsSI https://[demo-host]/portal/
curl -fsSI https://[demo-host]/
```

CI на `main` собирает три образа и делает `kubectl apply -k` + rollout.
