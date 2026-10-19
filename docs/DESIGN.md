# Diseño

Resumen operativo del MVP. El spec completo y aprobado está en
[`superpowers/specs/2026-10-18-ordena-tu-pyme-mvp-design.md`](superpowers/specs/2026-10-18-ordena-tu-pyme-mvp-design.md);
si difieren, manda el spec.

## Producto

SaaS multiempresa de flujo de caja y cuentas por pagar para pymes chilenas. El registro crea
usuario y empresa; los datos se aíslan por `companyId`.

Dentro del MVP: movimientos con categorías (operacional o inversión), proveedores, facturas por
pagar, importación de cartola CSV/XLSX, resumen mensual, proyección a 30/60/90 días y alertas de
vencimiento.

Fuera del MVP: integración con el SII, API bancaria, roles, un usuario en varias empresas, pagos
parciales, emails y proyección de ingresos.

## Modelo

`companies`, `users`, `categories`, `suppliers`, `transactions`, `bills`. Todas las tablas salvo
`companies` llevan `companyId`. Hoy solo existe `companies`; el resto llega por fases.

- Montos: enteros en CLP.
- RUT: módulo 11, guardado como `12345678-K`. Único por empresa en proveedores.
- Estado de factura: calculado (`paid`, `overdue`, `pending`), no guardado.
- Pago de factura: crea el egreso y fija `paidTransactionId` en una sola transacción. Solo pago total.
- Importación: `importHash` = hash de (companyId, fecha, monto, descripción), único por empresa.

## Aislamiento

JWT en cookie httpOnly; un guard global inyecta `userId` y `companyId`. Toda consulta filtra por
`companyId`. Un recurso de otra empresa responde 404. No se usa Row Level Security en el MVP.

## API

Prefijo `/v1`, excepto `GET /health`. Validación con Zod: errores 400 con `details` por campo.
Endpoints previstos: `auth`, CRUD de `categories`, `transactions`, `suppliers` y `bills`,
`POST /bills/:id/pay`, `import/preview` y `import/commit`, `reports/summary`,
`reports/projection` y `reports/alerts`.
