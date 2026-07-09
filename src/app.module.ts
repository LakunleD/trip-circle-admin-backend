import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { BetaTestersModule } from './beta-testers/beta-testers.module';
import { BetaWavesModule } from './beta-waves/beta-waves.module';
import { BugsModule } from './bugs/bugs.module';
import { FeedbackModule } from './feedback/feedback.module';
import { SurveysModule } from './surveys/surveys.module';
import { ContentBankModule } from './content-bank/content-bank.module';

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AlertsModule,
    AuthModule,
    AdminUsersModule,
    // ── Beta dashboard ───────────────────────────────
    BetaTestersModule,
    BetaWavesModule,
    BugsModule,
    FeedbackModule,
    SurveysModule,
    ContentBankModule,
    // ── Feature board + Circle — modules missing from disk, to be rebuilt ──
  ],
  controllers: [HealthController],
})
export class AppModule {}
