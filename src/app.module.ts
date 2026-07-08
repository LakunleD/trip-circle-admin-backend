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
import { FeaturesModule } from './features/features.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { FeatureImportModule } from './feature-import/feature-import.module';
import { FeatureNotificationsModule } from './feature-notifications/feature-notifications.module';
import { OpsAiModule } from './ops-ai/ops-ai.module';
import { CircleModule } from './circle/circle.module';

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
    // ── Feature board (ops.tripcircle.us) ───────────
    FeaturesModule,
    TeamMembersModule,
    FeatureImportModule,
    FeatureNotificationsModule,
    OpsAiModule,
    // ── The Circle (user voice channel) ─────────────
    CircleModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
