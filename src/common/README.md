# Infraestructura Común - Fase 1

Este directorio contiene los componentes de infraestructura común implementados en la Fase 1 de la migración.

## Value Objects

### Email
Valida y normaliza direcciones de email.

```typescript
import { Email } from 'src/common/value-objects';

// Crear un email
const email = new Email('user@example.com');

// Obtener el valor
console.log(email.getValue()); // 'user@example.com'

// Verificar igualdad
const email2 = new Email('USER@EXAMPLE.COM');
console.log(email.equals(email2)); // true (se normaliza a minúsculas)
```

### Password
Valida contraseñas según reglas de seguridad.

```typescript
import { Password } from 'src/common/value-objects';

// Crear una contraseña
const password = new Password('MySecure123!');

// Validar sin crear instancia
if (Password.isValid('weak')) {
  // Contraseña válida
}
```

### UserId
Maneja identificadores únicos de usuario (UUID).

```typescript
import { UserId } from 'src/common/value-objects';

// Crear un nuevo ID
const userId = UserId.create();

// Crear desde string existente
const userId2 = UserId.fromString('123e4567-e89b-12d3-a456-426614174000');

// Verificar validez
if (UserId.isValid('invalid-uuid')) {
  // UUID válido
}
```

## Validadores para DTOs

### Uso en DTOs
```typescript
import { IsValidEmail, IsValidPassword } from 'src/common/validators/value-object.validator';

export class LoginDto {
  @IsValidEmail()
  email: string;

  @IsValidPassword()
  password: string;
}
```

## Logging Estructurado

### NativeLoggerService
Proporciona logging estructurado usando el logger nativo de NestJS.

```typescript
import { NativeLoggerService } from 'src/infrastructure/logger/native-logger.service';

@Injectable()
export class MyService {
  constructor(
    @Inject(NativeLoggerService) private readonly logger: NativeLoggerService,
  ) {
    this.logger.setContext(MyService.name);
  }

  async doSomething() {
    // Logging básico
    this.logger.log('Operation started');
    this.logger.error('Something went wrong', 'stack trace');

    // Logging estructurado
    this.logger.logStructured('log', 'User operation', {
      userId: '123',
      operation: 'login',
      timestamp: new Date(),
    });

    // Logging específico de autenticación
    this.logger.logAuth('login_success', 'user123', 'user@example.com');
    this.logger.logAuthError('login', 'Invalid credentials', 'user123', 'user@example.com');
  }
}
```

## Internacionalización

### Uso en servicios
```typescript
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MyService {
  constructor(private readonly i18n: I18nService) {}

  async doSomething() {
    // Obtener mensaje traducido
    const message = this.i18n.t('common.auth.login.success');
    
    // Con parámetros
    const messageWithParams = this.i18n.t('common.auth.login.failed', {
      args: { email: 'user@example.com' }
    });
  }
}
```

### Archivos de traducción
- `src/infrastructure/i18n/locales/es.json` - Español
- `src/infrastructure/i18n/locales/en.json` - Inglés

## Migración Gradual

### Paso 1: Actualizar DTOs
Reemplazar validaciones manuales con Value Objects:

```typescript
// Antes
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// Después
export class LoginDto {
  @IsValidEmail()
  email: string;

  @IsValidPassword()
  password: string;
}
```

### Paso 2: Actualizar Servicios
Usar Value Objects para validación y logging estructurado:

```typescript
// Antes
async execute(loginDto: LoginDto) {
  const { email, password } = loginDto;
  // validación manual...
}

// Después
async execute(loginDto: LoginDto) {
  const email = new Email(loginDto.email);
  const password = new Password(loginDto.password);
  this.logger.logAuth('login_attempt', undefined, email.getValue());
  // ...
}
```

## Próximos Pasos

1. **Fase 2**: Mejorar entidades de dominio
2. **Fase 3**: Implementar servicios de dominio
3. **Fase 4**: Implementar CQRS
4. **Fase 5**: Mejorar guards y middleware
