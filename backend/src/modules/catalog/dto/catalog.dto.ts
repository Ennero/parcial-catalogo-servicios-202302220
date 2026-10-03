import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateServicioN1Dto {
  @IsNotEmpty({ message: 'El código de servicio N1 es obligatorio (ej. SE.01).' })
  @IsString()
  codigo: string;

  @IsNotEmpty({ message: 'El nombre del servicio N1 es obligatorio.' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateServicioN1Dto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CreateServicioN2Dto {
  @IsNotEmpty({ message: 'El código de servicio N2 es obligatorio (ej. SE.01.01).' })
  @IsString()
  codigo: string;

  @IsNotEmpty({ message: 'El nombre del servicio N2 es obligatorio.' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El ID del servicio N1 padre es obligatorio.' })
  @IsNumber()
  servicioN1Id: number;

  @IsOptional()
  @IsString()
  estadoActivo?: string; // 'S', 'N', 'DESCONOCIDO'

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  metrica?: string;

  @IsOptional()
  @IsNumber()
  minimo?: number | null;

  @IsOptional()
  @IsNumber()
  maximo?: number | null;

  @IsOptional()
  @IsNumber()
  claseId?: number | null;

  @IsOptional()
  @IsNumber()
  criticidadId?: number | null;

  @IsOptional()
  @IsNumber()
  tipoId?: number | null;

  @IsOptional()
  @IsNumber()
  seccionResponsableId?: number | null;

  @IsOptional()
  @IsNumber()
  usuarioResponsableId?: number | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateServicioN2Dto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  servicioN1Id?: number;

  @IsOptional()
  @IsString()
  estadoActivo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  metrica?: string;

  @IsOptional()
  minimo?: number | null;

  @IsOptional()
  maximo?: number | null;

  @IsOptional()
  @IsNumber()
  claseId?: number | null;

  @IsOptional()
  @IsNumber()
  criticidadId?: number | null;

  @IsOptional()
  @IsNumber()
  tipoId?: number | null;

  @IsOptional()
  @IsNumber()
  seccionResponsableId?: number | null;

  @IsOptional()
  @IsNumber()
  usuarioResponsableId?: number | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class FilterServiciosQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  servicioN1Id?: string;

  @IsOptional()
  @IsString()
  claseId?: string;

  @IsOptional()
  @IsString()
  criticidadId?: string;

  @IsOptional()
  @IsString()
  tipoId?: string;

  @IsOptional()
  @IsString()
  activo?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
