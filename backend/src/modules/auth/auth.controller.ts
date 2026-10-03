import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { Request } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    return this.authService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const user = req.user;
    return {
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
    };
  }
}
