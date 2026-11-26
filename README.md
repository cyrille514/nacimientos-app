# Gestión de Nacimientos

Aplicación web para registrar y consultar nacimientos en un centro sanitario: madres, partos, recién nacidos (incluidos los partos múltiples), certificados en PDF y gestión de usuarios con roles.

- **Cliente:** https://nacimientos-app-u8ha.vercel.app
- **API:** https://nacimientos-app.vercel.app/api

> Proyecto de formación. Antes de usarlo con datos reales de pacientes hay que resolver el cumplimiento del RGPD (alojamiento en la UE, contratos con los proveedores y política de privacidad).

## Funcionalidades

- Inicio de sesión con renovación automática de la sesión.
- Panel con cifras (partos, niñas y niños, cesáreas, peso medio) y últimos nacimientos.
- Nacimientos: alta, listado con búsqueda y filtros (madre, fechas, médico y tipo de parto), ficha detallada, edición y eliminación.
- Partos múltiples (hasta 5 recién nacidos por parto) y certificado de nacimiento en PDF por bebé.
- Usuarios (solo administradores): crear, cambiar rol, activar o desactivar y cambiar la contraseña.
- Interfaz adaptable a móvil, tablet y escritorio.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Cliente | React, Vite, Tailwind CSS 4, React Router, Lucide, jsPDF |
| API | Node.js, Express 5, Zod, Helmet, express-rate-limit |
| Datos y acceso | Supabase (PostgreSQL, Auth, RLS) |
| Despliegue | Vercel (dos proyectos: API y cliente) |

## Estructura

```
nacimientos-app/
├── client/                  # React
│   └── src/
│       ├── components/      # Componentes del dominio
│       │   └── ui/          # Sistema de diseño reutilizable
│       ├── constants/       # Etiquetas y límites
│       ├── context/         # Sesión (AuthContext)
│       ├── hooks/           # Lógica de negocio y estado
│       ├── pages/           # Pantallas (solo composición)
│       ├── services/        # Llamadas HTTP
│       └── utils/           # Funciones puras (fechas, mapeadores, PDF)
└── server/                  # Express
    ├── config/              # Cliente de Supabase
    ├── controllers/         # Lógica de cada recurso
    ├── middlewares/         # Autenticación, roles, validación y errores
    ├── routes/              # Rutas
    ├── validators/          # Esquemas Zod
    └── utils/               # Mapeadores y utilidades
```

## Roles

| Acción | Administrador | Médico | Administrativo |
|---|:-:|:-:|:-:|
| Ver, crear y editar nacimientos | ✅ | ✅ | ✅ |
| Eliminar nacimientos y recién nacidos | ✅ | — | — |
| Gestionar usuarios y consultar la auditoría | ✅ | — | — |

## Puesta en marcha

Requisitos: Node.js 22 o superior, pnpm y un proyecto de Supabase.

### 1. Base de datos

Tablas: `perfil` (usuarios y rol), `medico`, `madre`, `nacimiento`, `recien_nacido` y `auditoria`. Una madre tiene varios nacimientos, y un nacimiento tiene uno o más recién nacidos. Todas tienen RLS activado.

La búsqueda por nombre y documento usa una columna calculada en `madre`:

```sql
alter table madre
  add column busqueda text
  generated always as (lower(nombre || ' ' || apellidos || ' ' || documento_id)) stored;
```

Crea tu usuario en **Authentication → Users** (marca *Auto Confirm User*) y hazlo administrador:

```sql
insert into perfil (id, nombre, rol)
select id, 'Administrador', 'admin'
from auth.users
where email = 'tu-email@ejemplo.com';
```

### 2. API

```bash
cd server
cp .env.example .env     # rellena los valores
pnpm install
pnpm start               # http://localhost:3000
```

### 3. Cliente

```bash
cd client
cp .env.example .env
pnpm install
pnpm dev                 # http://localhost:5173
```

## Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `SUPABASE_URL` | API | Dirección del proyecto de Supabase |
| `SUPABASE_SERVICE_KEY` | API | Clave **secret**. Solo en el servidor |
| `SUPABASE_ANON_KEY` | API | Clave **publishable** |
| `CLIENT_URL` | API | Direcciones del cliente separadas por comas (CORS) |
| `PORT` | API | Puerto local (opcional) |
| `VITE_API_URL` | Cliente | Dirección de la API, terminada en `/api` |

## API

Todas las rutas cuelgan de `/api` y, salvo las de acceso, exigen `Authorization: Bearer <token>`.

| Método y ruta | Descripción |
|---|---|
| `GET /health` | Estado del servicio |
| `POST /auth/login` · `/auth/refresh` | Iniciar sesión y renovar el token |
| `POST /auth/forgot-password` | Enviar el correo de recuperación (aún sin pantalla en el cliente) |
| `GET /auth/me` · `POST /auth/logout` · `PATCH /auth/password` | Cuenta propia |
| `POST /auth/register` | Crear una cuenta (administrador) |
| `GET /nacimientos` | Lista. Parámetros: `q`, `desde`, `hasta`, `medicoId`, `tipoParto` |
| `POST /nacimientos` | Crear |
| `GET · PATCH /nacimientos/:id` | Ficha y edición |
| `DELETE /nacimientos/:id` | Eliminar (administrador) |
| `POST /nacimientos/:id/recien-nacidos` | Añadir un bebé |
| `PATCH · DELETE /nacimientos/:id/recien-nacidos/:rnId` | Editar o eliminar un bebé (eliminar: administrador) |
| `GET /medicos` | Médicos activos |
| `GET · POST /usuarios` · `PATCH /usuarios/:id` · `POST /usuarios/:id/password` | Gestión de usuarios (administrador) |

## Despliegue (Vercel)

Dos proyectos del mismo repositorio:

| Proyecto | Directorio raíz | Variables |
|---|---|---|
| API | `server` | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `CLIENT_URL` |
| Cliente | `client` | `VITE_API_URL` |

1. `CLIENT_URL` debe contener la dirección del cliente, sin `/` final.
2. Vite integra `VITE_API_URL` al compilar: si cambia, hay que volver a desplegar el cliente.
3. Tras modificar cualquier variable hay que hacer *Redeploy*.

Cada `push` a `main` redespliega ambos proyectos.

## Seguridad

- La clave `service_role` solo vive en el servidor: el navegador únicamente habla con la API.
- RLS activado en todas las tablas, con políticas por rol y sin privilegios para el rol `anon`.
- Validación de entradas con Zod, cabeceras con Helmet, CORS restringido y límite de intentos en el acceso.
- Auditoría de cambios en madres, nacimientos y recién nacidos (solo lectura para administradores).

## Mejoras previstas

- Paginación del listado y estadísticas calculadas en el servidor.
- Pantalla de recuperación de contraseña (la API ya expone `POST /auth/forgot-password`).
- Pruebas automáticas e integración continua.
- Guía de estilo interna.
- Aviso al salir de una ficha con cambios sin guardar.
