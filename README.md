# Sistema de Control de Inventario — Constructora Del Valle S.A.

**Trabajo Práctico — Gestión de Inventarios**

**Equipo:** Ernesto Libby Lugo

---

## Descripción

Sistema web completo de control de inventario diseñado para la empresa Constructora Del Valle S.A. Permite gestionar materiales, movimientos de inventario, órdenes de compra con aprobación por niveles jerárquicos, detección de posibles duplicados y trazabilidad completa.

## Funcionalidades Principales

### 1. Registro de Materiales
- CRUD de materiales con parámetros: demanda promedio/máxima diaria, tiempo de entrega
- **Cálculo automático** de Stock de Seguridad (SS) y Punto de Reorden (PR)
- Stock actual calculado en tiempo real a partir de movimientos

### 2. Movimientos de Inventario
- Tipos: Entrada, Salida, Traslado, Ajuste
- Cada movimiento registra: fecha, usuario, cantidad, ubicación, documento de origen
- Generación automática de alertas cuando el stock cae bajo el punto de reorden

### 3. Alertas de Reorden
- Se generan automáticamente al registrar movimientos
- Tabla de alertas activas en la base de datos
- Visibles en el dashboard y en la página de alertas

### 4. Detección de Duplicados
- **Regla documentada:** Dos OC son posibles duplicados cuando:
  1. Mismo proveedor
  2. Mismo material (al menos una línea coincidente)
  3. Cantidad dentro del ±20%
  4. Diferencia de fecha ≤ 3 días
- Implementado con query SQL optimizado

### 5. Trazabilidad
- Búsqueda por material
- Historial completo de movimientos con detalle de OC de origen

### 6. Matriz de Aprobación (Punto Extra)
- Las OC quedan en estado "PENDIENTE_APROBACION" según monto total:
  | Rango de Monto | Nivel Requerido |
  |---|---|
  | Hasta ₡250,000 | Jefatura del Área |
  | ₡250,001 – ₡2,000,000 | Jefatura de Compras |
  | ₡2,000,001 – ₡10,000,000 | Gerencia Financiera |
  | Más de ₡10,000,000 | Gerencia General |

## Fórmulas de Inventario

```
Stock de Seguridad (SS) = (demanda_máxima - demanda_promedio) × tiempo_entrega
Punto de Reorden (PR) = demanda_promedio × tiempo_entrega + SS
```

## Tecnologías

- **Frontend:** Dashboard web con componentes UI profesionales
- **Backend:** API REST con Node.js
- **Base de Datos:** PostgreSQL con ORM Prisma
- **Autenticación:** Auth.js con roles por usuario

## API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/materiales` | Lista materiales con stock calculado |
| POST | `/api/materiales` | Crear nuevo material |
| GET | `/api/materiales/[id]/stock` | Detalle de stock de un material |
| GET | `/api/materiales/[id]/trazabilidad` | Historial de movimientos |
| GET | `/api/movimientos` | Lista últimos movimientos |
| POST | `/api/movimientos` | Registrar movimiento (recalcula stock y alertas) |
| GET | `/api/ordenes` | Lista órdenes de compra |
| POST | `/api/ordenes` | Crear OC (calcula nivel aprobación) |
| PUT | `/api/ordenes/[id]/aprobar` | Aprobar OC (valida rol) |
| PUT | `/api/ordenes/[id]/rechazar` | Rechazar OC |
| GET | `/api/ordenes/posibles-duplicados` | Detectar duplicados |
| GET | `/api/alertas/reorden` | Alertas activas |
| PUT | `/api/alertas/[id]/resolver` | Marcar alerta como resuelta |
| GET | `/api/dashboard` | Datos del dashboard |

## Datos Semilla

El sistema incluye datos precargados del ejercicio:
- **4 materiales** con sus parámetros de inventario
- **7 proveedores**
- **7 órdenes de compra** de octubre (incluye 1 OC pendiente de aprobación)
- **Movimientos** de entrada y salida que resultan en los stocks del ejercicio
- **Alertas** preexistentes (reorden, duplicados, sobreprecios)
- **6 usuarios** con distintos roles para probar la matriz de aprobación

### Stocks Resultantes del Seed
| Material | Stock Actual | SS | PR | Estado |
|---|---|---|---|---|
| Cemento gris 50 kg | 190 sacos | 45 | 165 | OK |
| Varilla #3 grado 40 | 850 unidades | 200 | 800 | OK (cercano) |
| Block 12×20×40 | 2,800 unidades | 1,200 | 3,600 | CRÍTICO |
| Arena (m³) | 14 m³ | 8 | 20 | CRÍTICO |

### Usuarios de Prueba
| Email | Rol |
|---|---|
| jefe.obras@delvalle.cr | Jefatura de Área |
| jefe.compras@delvalle.cr | Jefatura de Compras |
| gerente.financiero@delvalle.cr | Gerencia Financiera |
| gerente.general@delvalle.cr | Gerencia General |
| bodega@delvalle.cr | Bodeguero |

**Contraseña para todos:** `Delvalle2024!`

## Instalación

```bash
# 1. Clonar el repositorio e instalar dependencias
yarn install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de la base de datos PostgreSQL

# 3. Generar cliente Prisma y crear tablas
yarn prisma generate
yarn prisma db push

# 4. Cargar datos semilla
yarn prisma db seed

# 5. Iniciar servidor de desarrollo
yarn dev
```

## Licencia

Proyecto académico — Gestión de Inventarios.
