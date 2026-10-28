import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  IsArray,
} from 'class-validator';
import {
  TipoTicket,
  EstadoTicket,
  PrioridadTicket,
  ImpactoTicket,
  UrgenciaTicket,
  CanalTicket,
} from '../../../entities/ticket.entity';
import { ProcesoServiceDesk } from '../../../entities/cola-atencion.entity';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @IsNotEmpty()
  solicitanteId: number;

  @IsNumber()
  @IsNotEmpty()
  servicioN2Id: number;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'solicitud_acceso',
    'evento',
    'incidente',
    'solicitud_cambio',
    'requisicion_servicio',
    'problema',
  ])
  tipo: TipoTicket;

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
  @IsNotEmpty()
  colaId: number;

  @IsString()
  @IsOptional()
  @IsIn(['muy_alta', 'alta', 'media', 'baja', 'muy_baja'])
  prioridad?: PrioridadTicket;

  @IsString()
  @IsOptional()
  @IsIn(['alto', 'medio', 'bajo'])
  impacto?: ImpactoTicket;

  @IsString()
  @IsOptional()
  @IsIn(['alta', 'media', 'baja'])
  urgencia?: UrgenciaTicket;

  @IsString()
  @IsOptional()
  @IsIn(['portal', 'correo', 'telefono', 'monitoreo', 'chat'])
  canal?: CanalTicket;

  @IsArray()
  @IsOptional()
  ciIds?: number[];

  @IsString()
  @IsOptional()
  sinCiJustificacion?: string;

  @IsOptional()
  metadataProceso?: any;
}

export class UpdateEstadoTicketDto {
  @IsString()
  @IsNotEmpty()
  nuevoEstado: EstadoTicket;

  @IsString()
  @IsOptional()
  motivo?: string;

  @IsString()
  @IsOptional()
  solucionAplicada?: string;

  @IsOptional()
  metadataAdicional?: any;
}

export class TransferirTicketDto {
  @IsNumber()
  @IsNotEmpty()
  nuevaColaId: number;

  @IsString()
  @IsNotEmpty()
  motivo: string;
}

export class ReabrirTicketDto {
  @IsString()
  @IsNotEmpty()
  motivo: string;
}

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsBoolean()
  @IsOptional()
  esNotaInterna?: boolean;
}

export class RelacionarTicketsDto {
  @IsNumber()
  @IsNotEmpty()
  ticketDestinoId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['causa', 'relacionado_con', 'duplicado_de', 'resuelve', 'genera_incidente'])
  tipoRelacion: 'causa' | 'relacionado_con' | 'duplicado_de' | 'resuelve' | 'genera_incidente';

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class CreateFaqDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsNumber()
  @IsOptional()
  servicioN2Id?: number;
}
