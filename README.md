# 🔐 Auth Service - Ally 360

Servicio de autenticación y autorización para la plataforma Ally 360, construido con NestJS y PostgreSQL.

## 📋 Descripción

Este servicio maneja la autenticación de usuarios, registro, login, y gestión de perfiles de usuario. Está diseñado para integrarse con el ecosistema de microservicios de Ally 360.

## 🚀 Características

- **Autenticación JWT**: Sistema de tokens seguro con expiración configurable
- **Registro de usuarios**: Creación de cuentas con validación de datos
- **Login seguro**: Autenticación con hash de contraseñas
- **Gestión de perfiles**: Información personal del usuario
- **Base de datos PostgreSQL**: Con soporte para transacciones
- **Validación de datos**: Con Joi y class-validator
- **Documentación API**: Swagger integrado
- **Rate limiting**: Protección contra abuso de API
- **Logging estructurado**: Con diferentes niveles de detalle

## 🛠️ Tecnologías

- **Framework**: NestJS 11
- **Base de datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT con Passport
- **Validación**: Joi + class-validator
- **Documentación**: Swagger/OpenAPI
- **Transacciones**: typeorm-transactional
- **Testing**: Jest

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd auth-service

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

## ⚙️ Configuración

### Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las siguientes variables:

#### Aplicación
- `NODE_ENV`: Entorno de ejecución (local, development, prod)
- `PORT`: Puerto HTTP del servicio
- `ENABLE_SWAGGER`: Habilitar documentación Swagger

#### Base de Datos (PostgreSQL)
- `DB_HOST`: Host de la base de datos
- `DB_PORT`: Puerto de PostgreSQL (default: 5432)
- `DB_USERNAME`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_DATABASE`: Nombre de la base de datos
- `DB_SSL`: Habilitar SSL para conexiones seguras

#### Seguridad JWT
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `JWT_EXPIRES_IN`: Tiempo de expiración del token

#### CORS
- `CORS_ORIGIN`: Orígenes permitidos (separados por comas)

#### Logging
- `LOG_LEVEL`: Nivel de logging (debug, info, warn, error)

#### Rate Limiting
- `RATE_LIMIT_WINDOW_MS`: Ventana de tiempo en milisegundos
- `RATE_LIMIT_MAX_REQUESTS`: Máximo de requests por ventana

## 🚀 Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Testing
npm run test
npm run test:e2e
```

## 📚 API Endpoints

### Autenticación
- `POST /v1/auth/login` - Iniciar sesión
- `POST /v1/auth/register` - Registrar nuevo usuario

### Usuarios
- `GET /v1/auth/user/profile` - Obtener perfil del usuario
- `PUT /v1/auth/user/profile` - Actualizar perfil del usuario

### Documentación
- `GET /api` - Documentación Swagger (si está habilitada)

## 🗄️ Base de Datos

### Entidades Principales

- **User**: Información de autenticación del usuario
- **Profile**: Perfil personal del usuario
- **BaseEntity**: Campos comunes (timestamps, soft delete)

### Migraciones

```bash
# Generar migración
npm run migration:generate

# Ejecutar migraciones
npm run migration:run

# Revertir migración
npm run migration:revert
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración configurable
- Rate limiting para prevenir abuso
- Validación de datos en todos los endpoints
- CORS configurado para orígenes específicos

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:cov
```

## 📝 Logs

El servicio utiliza logging estructurado con diferentes niveles:
- **debug**: Información detallada para desarrollo
- **info**: Información general de operaciones
- **warn**: Advertencias y situaciones no críticas
- **error**: Errores y excepciones

## 🚧 TODO

- [ ] Integración con KeyCloak para gestión de roles
- [ ] Implementación de verificación de email
- [ ] Sistema de recuperación de contraseñas
- [ ] Gestión de empresas del usuario
- [ ] Implementación de refresh tokens
- [ ] Métricas y monitoreo
- [ ] Tests de integración completos

## 📄 Licencia

Este proyecto es privado y está bajo licencia UNLICENSED.

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo de Ally 360.
