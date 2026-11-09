# apps/api — Demo v1 NestJS API (I1)

Minimal NestJS scaffold for Pharma Demo Demo v1.

## Run

```bash
npm install
npm run start:dev
# http://localhost:3001/health
# http://localhost:3001/api  (Swagger)
# http://localhost:3001/v1/projects/PRT-01
```

## Data access

- Fixtures A/B/C: `src/data/fixtures/` (DOC-PROD-012)
- Port: `DemoDataSource` (`src/data/demo-data-source.ts`)
- Adapter: `MockDemoDataSource` (in-memory; not a DB PersistencePort)

## Tests

```bash
npm test
npm run test:e2e
```
