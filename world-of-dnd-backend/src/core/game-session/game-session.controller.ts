import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameSessionService } from './game-session.service';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { SyncGameSessionDto } from './dto/sync-game-session.dto';

@Controller('game-sessions')
@UseGuards(JwtAuthGuard)
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  // GET /game-sessions - Lista game sessions dell'utente
  @Get()
  async findAll(@Request() req) {
    return this.gameSessionService.findAllByUser(req.user.userId);
  }

  // GET /game-sessions/data/skills - Lista tutte le skills disponibili
  @Get('data/skills')
  async getAllSkills(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.gameSessionService.getAllSkills(search, pageNum, limitNum);
  }

  // GET /game-sessions/data/spells - Lista tutti gli spells disponibili
  @Get('data/spells')
  async getAllSpells(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.gameSessionService.getAllSpells(search, pageNum, limitNum);
  }

  // GET /game-sessions/data/talents - Lista tutti i talents disponibili
  @Get('data/talents')
  async getAllTalents(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.gameSessionService.getAllTalents(search, pageNum, limitNum);
  }

  // GET /game-sessions/:id - Dettaglio game session
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.gameSessionService.findOne(id, req.user.userId);
  }

  // POST /game-sessions - Crea nuova game session
  @Post()
  async create(@Body() createDto: CreateGameSessionDto, @Request() req) {
    return this.gameSessionService.create(req.user.userId, createDto);
  }

  // PUT /game-sessions/:id - Aggiorna game session
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGameSessionDto,
    @Request() req,
  ) {
    return this.gameSessionService.update(id, req.user.userId, updateDto);
  }

  // DELETE /game-sessions/:id - Elimina game session
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.gameSessionService.remove(id, req.user.userId);
  }

  // POST /game-sessions/:id/sync - Sincronizza dati
  @Post(':id/sync')
  async sync(
    @Param('id', ParseIntPipe) id: number,
    @Body() syncDto: SyncGameSessionDto,
    @Request() req,
  ) {
    // Lightweight logging to inspect incoming payload shape (for debugging)
    try {
      Logger.log(`Sync request session=${id} user=${req?.user?.userId}`, 'GameSessionController.sync');
      Logger.debug({
        hasData: !!syncDto?.data,
        dataKeys: syncDto?.data ? Object.keys(syncDto.data) : [],
        payloadSample: syncDto?.data ? (Array.isArray(syncDto.data.characters) ? `characters:${syncDto.data.characters.length}` : typeof syncDto.data) : 'no-data'
      }, 'GameSessionController.sync');
    } catch (e) {
      // swallow logging errors to avoid breaking request flow
      console.warn('Logging failed in GameSessionController.sync', e);
    }

    try {
      const result = await this.gameSessionService.sync(id, req.user.userId, syncDto.data);
      Logger.log(`Sync completed session=${id}`, 'GameSessionController.sync');
      return result;
    } catch (err) {
      Logger.error('Sync failed', err, 'GameSessionController.sync');
      throw err;
    }
  }
}
