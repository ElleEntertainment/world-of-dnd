import { Module } from '@nestjs/common';
import { GameSessionController } from './game-session.controller';
import { GameSessionService } from './game-session.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GameSessionController],
  providers: [GameSessionService],
  exports: [GameSessionService],
})
export class GameSessionModule {}
