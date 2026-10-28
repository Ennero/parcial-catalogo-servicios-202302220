import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { ProcesoServiceDesk, ReglaOrdenamiento } from '../../../entities/cola-atencion.entity';

export class CreateColaDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'nuevos_servicios',
    'cambios',
    'incidentes',
    'eventos',
    'problemas',
    'accesos',
    'servicios_ti',
  ])
  proceso: ProcesoServiceDesk;

  @IsNumber()
  @Min(0)
  @Max(4)
  nivelSoporte: number;

  @IsNumber()
  @IsOptional()
  slaMinutosPrimeraAtencion?: number;

  @IsNumber()
  @IsOptional()
  slaMinutosResolucion?: number;

  @IsString()
  @IsOptional()
  @IsIn(['calendario', 'habil'])
  tipoTiempo?: string;

  @IsString()
  @IsOptional()
  @IsIn(['prioridad_antiguedad', 'antiguedad', 'sla'])
  reglaOrdenamiento?: ReglaOrdenamiento;

  @IsString()
  @IsOptional()
  @IsIn(['manual', 'automatica', 'mixta'])
  politicaAsignacion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateColaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @Max(4)
  @IsOptional()
  nivelSoporte?: number;

  @IsNumber()
  @IsOptional()
  slaMinutosPrimeraAtencion?: number;

  @IsNumber()
  @IsOptional()
  slaMinutosResolucion?: number;

  @IsString()
  @IsOptional()
  tipoTiempo?: string;

  @IsString()
  @IsOptional()
  reglaOrdenamiento?: ReglaOrdenamiento;

  @IsString()
  @IsOptional()
  politicaAsignacion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsNumber()
  @IsOptional()
  colaReasignacionId?: number; // Para transferir tickets en caso de desactivación
}

export class AsignarUsuarioColaDto {
  @IsNumber()
  @IsNotEmpty()
  colaId: number;

  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;

  @IsBoolean()
  @IsOptional()
  puedeConsultar?: boolean;

  @IsBoolean()
  @IsOptional()
  puedeAtender?: boolean;

  @IsBoolean()
  @IsOptional()
  puedeTransferir?: boolean;

  @IsBoolean()
  @IsOptional()
  puedeAprobar?: boolean;

  @IsBoolean()
  @IsOptional()
  puedeAdministrar?: boolean;
}

export class AsignarRolColaDto {
  @IsNumber()
  @IsNotEmpty()
  colaId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['administrador', 'consulta', 'agente', 'aprobador', 'solicitante'])
  rol: string;

  @IsBoolean()
  @IsOptional()
  puedeConsultar?: boolean;

  @IsBoolean()
  @IsOptional()
  puedeAtender?: boolean;

  @IsBoolean()
  @IsOptional()
  puedeTransferir?: boolean;

  @IsBoolean()
  @IsOptional()
  puedeAprobar?: boolean;

  @IsBoolean()
  @IsOptional()
  puedeAdministrar?: boolean;
}
