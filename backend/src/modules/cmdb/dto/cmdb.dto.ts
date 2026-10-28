import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateCmdbCategoriaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  nivel?: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class CreateCmdbCiDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  categoriaId: number;

  @IsString()
  @IsOptional()
  @IsIn(['operativo', 'mantenimiento', 'retirado', 'falla', 'en_almacen'])
  estado?: string;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @IsNumber()
  @IsNotEmpty()
  responsableId: number;

  @IsBoolean()
  @IsOptional()
  tieneIp?: boolean;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  mac?: string;

  @IsString()
  @IsOptional()
  numeroSerie?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  fabricante?: string;

  @IsString()
  @IsOptional()
  atributosTecnicos?: string;
}

export class CreateCmdbRelacionDto {
  @IsNumber()
  @IsNotEmpty()
  origenId: number;

  @IsNumber()
  @IsNotEmpty()
  destinoId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['depende_de', 'conectado_a', 'alojado_en'])
  tipoRelacion: 'depende_de' | 'conectado_a' | 'alojado_en';

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class VincularCiServicioDto {
  @IsNumber()
  @IsNotEmpty()
  ciId: number;

  @IsNumber()
  @IsNotEmpty()
  servicioN2Id: number;

  @IsString()
  @IsOptional()
  rolEnServicio?: string;
}

export class GenerarCisDto {
  @IsNumber()
  @IsOptional()
  cantidad?: number;

  @IsNumber()
  @IsOptional()
  semilla?: number;

  @IsBoolean()
  @IsOptional()
  forzarReinicio?: boolean;
}
