import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config.js';
import jwtConfig from './config/jwt.config.js';
import { SubmissionsModule } from './modules/submissions/submissions.module.js';
import { AttachmentsModule } from './modules/attachments/attachments.module.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { StaffModule } from './modules/staff/staff.module.js';
import { StudentsModule } from './modules/students/students.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CourseEditionsModule } from './modules/course-editions/course-editions.module.js';
import { CourseAssignmentsModule } from './modules/course-assignments/course-assignments.module.js';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module.js';
import { MeModule } from './modules/me/me.module.js';
import { CourseTopicsModule } from './modules/topics/course-topics.module.js';

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
    MeModule,
    StudentsModule,
    StaffModule,
    CoursesModule,
    CourseEditionsModule,
    CourseAssignmentsModule,
    EnrollmentsModule,
    CourseTopicsModule,
    AttachmentsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
