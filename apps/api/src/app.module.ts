import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChoicesModule } from './choices/choices.module';
import { Choice } from './entities/choice.entity';
import { Page } from './entities/page.entity';
import { Story } from './entities/story.entity';
import { User } from './entities/user.entity';
import { PagesModule } from './pages/pages.module';
import { StoriesModule } from './stories/stories.module';
import { UsersModule } from './users/users.module';

function typeOrmSqlJsConfig(config: ConfigService) {
  const dbPath = config.get<string>('DATABASE_PATH', './data.sqlite');
  const base = {
    type: 'sqljs' as const,
    entities: [User, Story, Page, Choice],
    synchronize: true,
  };
  if (!dbPath || dbPath === ':memory:') {
    return { ...base, autoSave: false };
  }
  return {
    ...base,
    autoSave: true,
    location: dbPath,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => typeOrmSqlJsConfig(config),
    }),
    UsersModule,
    AuthModule,
    StoriesModule,
    PagesModule,
    ChoicesModule,
  ],
})
export class AppModule {}
