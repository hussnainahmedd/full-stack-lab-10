import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbPassword = config.get<string>('DB_PASSWORD', '');
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', 5433)),
          username: config.get<string>('DB_USER', 'postgres'),
          password: dbPassword,
          database: config.get<string>('DB_NAME', 'lab10_db'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    UsersModule,
    NotesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
