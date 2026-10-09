import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config.js';
import jwtConfig from './config/jwt.config.js';
import { SubmissionsModule } from './modules/submissions/submissions.module.js';
import { AttachmentsModule } from './modules/attachments/attachments.module.js';
import { TopicsModule } from './modules/topics/topics.module.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { StaffModule } from './modules/staff/staff.module.js';
import { StudentsModule } from './modules/students/students.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database')!,
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    StaffModule,
    CoursesModule,
    TopicsModule,
    AttachmentsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
