import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '../modules/auth/token-blacklist.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly configService: ConfigService,
    private readonly blacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          return req?.cookies?.jwt || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'demo_secret_evaluation_parcial_202302220'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: number; username: string }) {
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req) || req?.cookies?.jwt;
    if (rawToken && this.blacklistService.isBlacklisted(rawToken)) {
      throw new UnauthorizedException('Sesión cerrada o token revocado.');
    }

    const user = await this.usuarioRepository.findOne({
      where: { id: payload.sub },
      relations: ['puesto', 'puesto.seccion'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado. Acceso denegado.');
    }

    return user;
  }
}
