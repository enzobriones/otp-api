# Ordena tu Pyme: diseño del MVP

Fecha: 2026-10-18 · Licencia: MIT · Repos: `otp-api` (NestJS 12), `otp-frontend` (Next 16 + shadcn)

## 1. Contexto y objetivo

El artículo de Xepelin ("Desafíos de las pymes en Chile") señala la gestión financiera como el dolor principal: flujo de caja desorganizado, registros poco confiables y dificultad para separar gastos de inversiones. Sin registros confiables, las pymes acceden a crédito caro y rígido. El 33% de las pymes no planifica. El artículo no entrega una cifra para el problema financiero, y su autor vende financiamiento, así que se usa como fuente de dolores, no como evidencia cuantitativa.

**Objetivo:** una app opensource (MIT) y desplegable como demo, que le dé a una pyme chilena un flujo de caja confiable y control de sus cuentas por pagar. Sirve también como pieza de portafolio.

**Criterio de éxito:** un usuario nuevo puede registrarse, importar su cartola bancaria, registrar facturas de proveedores y ver en el dashboard su saldo, su resumen mensual, la proyección de caja y las alertas de vencimiento.

## 2. Alcance

**Dentro del MVP**
- SaaS multi-empresa: el registro crea usuario y empresa, y los datos quedan aislados por empresa.
- Flujo de caja: ingresos y egresos con categorías, y separación operacional vs. inversión.
- Proveedores y facturas por pagar, con vencimientos.
- Ingreso de datos: formulario manual e importación de cartola CSV/XLSX.
- Reportes: resumen mensual, proyección 30/60/90 días y alertas.

**Fuera del MVP:** integración con el SII, API bancaria (Fintoc), roles/membresías, usuarios en varias empresas, pagos parciales, emails o notificaciones, proyección de ingresos futuros.

## 3. Arquitectura

```
otp-frontend (Next 16, shadcn)
        │ fetch + cookie httpOnly
        ▼
otp-api (NestJS 12)
  auth │ categories │ transactions │ suppliers │ bills │ import │ reports
        │ Drizzle ORM
        ▼
   PostgreSQL
```

- **Auth:** JWT en cookie httpOnly. Un guard global lee el token e inyecta `userId` y `companyId`; toda consulta de datos filtra por `companyId`.
- **Validación:** zod mediante un pipe propio. Los errores devuelven 400 con detalle por campo.
- **Aislamiento:** un recurso de otra empresa responde 404, no 403, para no revelar su existencia.
- **Deploy:** Railway (API, Postgres y web) con deploy desde GitHub. Las migraciones de Drizzle corren en el pre-deploy. El repo incluye `docker-compose.yml` para self-host. El frontend puede ir en Railway o en Vercel Hobby (solo uso no comercial); queda por decidir al implementar.
- **GCP:** se descarta para el MVP. Los USD 300 de crédito suelen vencer a los 90 días y Cloud SQL tiene costo mínimo mensual. La imagen Docker queda portable a Cloud Run si se quiere migrar.

## 4. Modelo de datos

| Tabla | Campos clave |
|---|---|
| `companies` | id, name, rut |
| `users` | id, companyId, email (único), passwordHash |
| `categories` | id, companyId, name, kind (`income`/`expense`), nature (`operational`/`investment`) |
| `suppliers` | id, companyId, name, rut, email?, phone?; `(companyId, rut)` único |
| `transactions` | id, companyId, date, amount, type (`income`/`expense`), categoryId, supplierId?, description, source (`manual`/`import`/`bill_payment`), importHash? |
| `bills` | id, companyId, supplierId, number?, amount, issueDate, dueDate, paidTransactionId? |

Decisiones:
- **Montos:** enteros en CLP, sin decimales ni punto flotante.
- **RUT:** se valida con módulo 11 y se guarda normalizado.
- **Categorías por defecto:** se crean al registrar la empresa.
- **Estado de factura:** se calcula, no se guarda. `paid` si hay `paidTransactionId`; `overdue` si no está pagada y `dueDate` es anterior a hoy; si no, `pending`.
- **Pago de factura:** crea el egreso (`source = bill_payment`) y fija `paidTransactionId` en una sola transacción de base de datos. Solo se permite el pago total.
- **Deduplicación de importación:** `importHash` = hash de (companyId, fecha, monto, descripción), con índice único por empresa.

## 5. API

Todo bajo autenticación salvo `register` y `login`.

- `POST /auth/register` (crea usuario, empresa y categorías por defecto), `POST /auth/login`, `POST /auth/logout`.
- CRUD de `categories`, `transactions` (filtros: rango de fechas, categoría, proveedor), `suppliers` y `bills`.
- `POST /bills/:id/pay` con `{ paidAt }`.
- `POST /import/preview`: recibe CSV/XLSX; devuelve columnas detectadas y filas de muestra.
- `POST /import/commit`: recibe el mapeo de columnas (fecha, descripción, monto, o cargo/abono) y una categoría por defecto; devuelve `{ inserted, duplicated, failed }` y el detalle de las filas con error.
- `GET /reports/summary?month=`: saldo, ingresos y egresos del mes, desglose por categoría y por naturaleza (operacional vs. inversión).
- `GET /reports/projection?days=30|60|90`: saldo actual menos las facturas pendientes según su vencimiento, como curva día a día. Solo considera salidas comprometidas.
- `GET /reports/alerts`: facturas vencidas y las que vencen en los próximos 7 días.

## 6. Frontend

Login y registro; dashboard (saldo, resumen del mes, gráfico de proyección, alertas); y pantallas de movimientos, importación (preview + mapeo), proveedores y facturas.

## 7. Manejo de errores

- Entrada inválida: 400 con errores por campo.
- Recurso ajeno o inexistente: 404.
- Credenciales inválidas: 401. Email repetido en el registro: 409.
- Importación tolerante: una fila mala no aborta el lote; se reporta en `failed`. Un archivo ilegible o sin columnas utilizables responde 400.

## 8. Testing y CI

- **Unitarios (vitest):** validación de RUT, cálculo de proyección, parseo y deduplicación de importación, estado de factura.
- **e2e (supertest, Postgres en Docker):** flujo completo registro → importar → facturar → pagar → reportes, y aislamiento entre dos empresas.
- **CI (GitHub Actions):** lint (oxlint), tests y e2e en cada push.

## 9. Riesgos y límites conocidos

- Los formatos de cartola varían por banco; el mapeo manual de columnas evita parsers por banco, a costa de un paso más para el usuario.
- La proyección ignora ingresos futuros, por lo que es conservadora.
- Un usuario pertenece a una sola empresa; soportar contadores con varias pymes requiere una tabla de membresías (v2).
