import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly blacklistService: TokenBlacklistService,
  ) {}

  async validateUser(identifier: string, pass: string): Promise<Usuario> {
    const user = await this.usuarioRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
      relations: ['puesto', 'puesto.seccion'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas: Usuario o contraseña incorrectos.');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Acceso denegado: El usuario se encuentra desactivado.');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas: Usuario o contraseña incorrectos.');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.identifier, loginDto.password);
    const payload = { sub: user.id, username: user.username, rol: user.rol };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        nombre: user.nombre,
        username: user.username,
        email: user.email,
        rol: user.rol,
        activo: user.activo,
        puesto: user.puesto
          ? {
              id: user.puesto.id,
              codigo: user.puesto.codigo,
              nombre: user.puesto.nombre,
              seccion: user.puesto.seccion
                ? {
                    id: user.puesto.seccion.id,
                    codigo: user.puesto.seccion.codigo,
                    nombre: user.puesto.seccion.nombre,
                  }
                : null,
            }
          : null,
      },
    };
  }

  async logout(rawToken: string) {
    if (rawToken) {
      this.blacklistService.add(rawToken);
    }
    return { message: 'Sesión cerrada exitosamente e invalidada en el servidor.' };
  }
}
