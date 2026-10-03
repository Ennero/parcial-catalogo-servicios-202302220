import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsEmail,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../entities/usuario.entity';

// Empresa DTOs
export class CreateEmpresaDto {
  @IsNotEmpty({ message: 'El código de empresa es obligatorio.' })
  @IsString()
  codigo: string;

  @IsNotEmpty({ message: 'El nombre de empresa es obligatorio.' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateEmpresaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// Area DTOs
export class CreateAreaDto {
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio.' })
  @IsNumber()
  empresaId: number;

  @IsNotEmpty({ message: 'El código del área es obligatorio.' })
  @IsString()
  codigo: string;

  @IsNotEmpty({ message: 'El nombre del área es obligatorio.' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateAreaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// Departamento DTOs
export class CreateDepartamentoDto {
  @IsNotEmpty({ message: 'El ID del área es obligatorio.' })
  @IsNumber()
  areaId: number;

  @IsNotEmpty({ message: 'El código del departamento es obligatorio.' })
  @IsString()
  codigo: string;

  @IsNotEmpty({ message: 'El nombre del departamento es obligatorio.' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateDepartamentoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// Seccion DTOs
export class CreateSeccionDto {
  @IsNotEmpty({ message: 'El ID del departamento es obligatorio.' })
  @IsNumber()
  departamentoId: number;

  @IsNotEmpty({ message: 'El código de la sección es obligatorio.' })
  @IsString()
  codigo: string;

  @IsNotEmpty({ message: 'El nombre de la sección es obligatorio.' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateSeccionDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// Puesto DTOs
export class CreatePuestoDto {
  @IsNotEmpty({ message: 'El ID de la sección es obligatorio.' })
  @IsNumber()
  seccionId: number;

  @IsNotEmpty({ message: 'El código del puesto es obligatorio.' })
  @IsString()
  codigo: string;

  @IsNotEmpty({ message: 'El nombre del puesto es obligatorio.' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdatePuestoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// Usuario DTOs
export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser administrador o consulta.' })
  rol?: UserRole;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsNumber()
  puestoId?: number;
}

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsNumber()
  puestoId?: number;
}
