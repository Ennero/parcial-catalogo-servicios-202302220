import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { HarnessService } from './harness.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';

@Controller('api/harness')
export class HarnessController {
  constructor(private readonly harnessService: HarnessService) {}

  @Get('status')
  async getStatus() {
    return this.harnessService.getLastRunStatus();
  }

  @Post('run')
  async runTests() {
    return this.harnessService.runAllTests();
  }
}
