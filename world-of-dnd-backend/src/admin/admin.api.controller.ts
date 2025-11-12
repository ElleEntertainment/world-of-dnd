import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../core/auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin/api')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminApiController {
  constructor(private readonly prisma: PrismaService) {}

  // Spells
  @Get('spells')
  async listSpells() {
    return this.prisma.spell.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('spells')
  async createSpell(@Body() body: any) {
    return this.prisma.spell.create({ data: body });
  }

  @Get('spells/:id')
  async getSpell(@Param('id') id: string) {
    return this.prisma.spell.findUnique({ where: { id: Number(id) } });
  }

  @Put('spells/:id')
  async updateSpell(@Param('id') id: string, @Body() body: any) {
    return this.prisma.spell.update({ where: { id: Number(id) }, data: body });
  }

  @Delete('spells/:id')
  async deleteSpell(@Param('id') id: string) {
    return this.prisma.spell.delete({ where: { id: Number(id) } });
  }

  // Talents
  @Get('talents')
  async listTalents() {
    return this.prisma.talent.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('talents')
  async createTalent(@Body() body: any) {
    return this.prisma.talent.create({ data: body });
  }

  @Get('talents/:id')
  async getTalent(@Param('id') id: string) {
    return this.prisma.talent.findUnique({ where: { id: Number(id) } });
  }

  @Put('talents/:id')
  async updateTalent(@Param('id') id: string, @Body() body: any) {
    return this.prisma.talent.update({ where: { id: Number(id) }, data: body });
  }

  @Delete('talents/:id')
  async deleteTalent(@Param('id') id: string) {
    return this.prisma.talent.delete({ where: { id: Number(id) } });
  }

  // Users (list only, no password exposure)
  @Get('users')
  async listUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, isVerified: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, email: true, name: true, isVerified: true, createdAt: true },
    });
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    // Prevent password updates via this endpoint
    const { password, ...data } = body;
    return this.prisma.user.update({
      where: { id: Number(id) },
      data,
    });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.prisma.user.delete({ where: { id: Number(id) } });
  }
}
