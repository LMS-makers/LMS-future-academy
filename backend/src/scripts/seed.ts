import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module.js';
import { User } from '../modules/users/entities/user.entity.js';
import { Staff } from '../modules/staff/entities/staff.entity.js';
import { Student } from '../modules/students/entities/student.entity.js';
import { UserRole, AccountStatus, Department, AcademicYear } from '../common/enums.js';

async function bootstrap() {
    console.log('🌱 Starting Database Seeder...');

    // Initialize the Nest application context (without starting the HTTP server)
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash('12345678', salt);

        console.log('🧹 Clearing old data (Optional - remove in production)...');
        await queryRunner.manager.createQueryBuilder().delete().from(Student).execute();
        await queryRunner.manager.createQueryBuilder().delete().from(Staff).execute();
        await queryRunner.manager.createQueryBuilder().delete().from(User).execute();

        // ---------------------------------------------------
        // 1. Create Admin
        // ---------------------------------------------------
        console.log('👤 Seeding Admin...');
        const adminUser = queryRunner.manager.create(User, {
            nationalId: '10000000000000',
            password: defaultPassword,
            email: 'admin@lms.edu',
            phone: '01000000000',
            role: UserRole.ADMIN, // Assuming ADMIN exists in UserRole enum
            accountStatus: AccountStatus.ACTIVE,
            isActive: true,
        });
        await queryRunner.manager.save(adminUser);

        // ---------------------------------------------------
        // 2. Create Doctor (Staff)
        // ---------------------------------------------------
        console.log('👨‍🏫 Seeding Doctor...');
        const doctorUser = queryRunner.manager.create(User, {
            nationalId: '20000000000000',
            password: defaultPassword,
            email: 'doctor@lms.edu',
            phone: '01100000000',
            role: UserRole.DOCTOR, // Assuming DOCTOR exists in UserRole enum
            accountStatus: AccountStatus.ACTIVE,
        });
        await queryRunner.manager.save(doctorUser);

        const doctorProfile = queryRunner.manager.create(Staff, {
            user: doctorUser,
            fullName: 'Dr. Ahmed Khaled',
            title: 'Professor of Computer Science',
            department: Department.GENERAL,
        });
        await queryRunner.manager.save(doctorProfile);

        // ---------------------------------------------------
        // 3. Create Students (All Auth Scenarios)
        // ---------------------------------------------------
        console.log('🎓 Seeding Students...');

        // Scenario A: PENDING_ACTIVATION (No Password)
        const student1User = queryRunner.manager.create(User, {
            nationalId: '30000000000001',
            role: UserRole.STUDENT,
            accountStatus: AccountStatus.PENDING_ACTIVATION,
        });
        await queryRunner.manager.save(student1User);
        await queryRunner.manager.save(queryRunner.manager.create(Student, {
            user: student1User, fullName: 'Student One (Pending)', studentCode: '20260001', academicYear: AcademicYear.YEAR_1, department: Department.GENERAL
        }));

        // Scenario B: INCOMPLETE_PROFILE (Has Password, No Email/Phone)
        const student2User = queryRunner.manager.create(User, {
            nationalId: '30000000000002',
            password: defaultPassword,
            role: UserRole.STUDENT,
            accountStatus: AccountStatus.INCOMPLETE_PROFILE,
        });
        await queryRunner.manager.save(student2User);
        await queryRunner.manager.save(queryRunner.manager.create(Student, {
            user: student2User, fullName: 'Student Two (Incomplete)', studentCode: '20260002', academicYear: AcademicYear.YEAR_1, department: Department.GENERAL
        }));

        // Scenario C: ACTIVE (Fully completed)
        const student3User = queryRunner.manager.create(User, {
            nationalId: '30000000000003', password: defaultPassword, email: 'student3@lms.edu', phone: '01200000003', role: UserRole.STUDENT, accountStatus: AccountStatus.ACTIVE,
        });
        await queryRunner.manager.save(student3User);
        await queryRunner.manager.save(queryRunner.manager.create(Student, {
            user: student3User, fullName: 'Student Three (Active)', studentCode: '20260003', academicYear: AcademicYear.YEAR_1, department: Department.GENERAL
        }));

        const student4User = queryRunner.manager.create(User, {
            nationalId: '30000000000004', password: defaultPassword, email: 'student4@lms.edu', phone: '01200000004', role: UserRole.STUDENT, accountStatus: AccountStatus.ACTIVE,
        });
        await queryRunner.manager.save(student4User);
        await queryRunner.manager.save(queryRunner.manager.create(Student, {
            user: student4User, fullName: 'Student Four (Active)', studentCode: '20260004', academicYear: AcademicYear.YEAR_1, department: Department.GENERAL
        }));

        await queryRunner.commitTransaction();
        console.log('✅ Seeding completed successfully!');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        await queryRunner.rollbackTransaction();
    } finally {
        await queryRunner.release();
        await app.close();
        process.exit(0);
    }
}

bootstrap();