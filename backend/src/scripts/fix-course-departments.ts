
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import XLSX from 'xlsx';
import { resolve } from 'node:path';
import { AppModule } from '../app.module.js';
import { Course } from '../modules/courses/entities/course.entity.js';
import { Department } from '../common/enums.js';

const EXCEL_PATH = resolve(
    process.cwd(),
    'src/data/Course_Import_Last.xlsx',
);

// Updates are disabled unless explicitly enabled.
const APPLY_CHANGES =
    process.env.APPLY_COURSE_DEPARTMENT_FIX === 'true';

function normalizeHeader(header: string): string {
    return header
        .replace(/\([^)]*\)/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
}

function normalizeRow(
    row: Record<string, unknown>,
): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
        normalized[normalizeHeader(key)] = value;
    }

    return normalized;
}

function mapDepartment(value: unknown): Department | null {
    const code = String(value ?? '').trim().toUpperCase();

    if (!code) {
        return null;
    }

    if (code === 'BS' || code.startsWith('H')) {
        return Department.GENERAL;
    }

    const departments: Record<string, Department> = {
        CS: Department.CS,
        IS: Department.IS,
        IT: Department.IT,
    };

    const department = departments[code];

    if (!department) {
        throw new Error(`Unknown specialization code: "${code}"`);
    }

    return department;
}

async function main(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const queryRunner = dataSource.createQueryRunner();

    try {
        await queryRunner.connect();

        const workbook = XLSX.readFile(EXCEL_PATH);
        const worksheet = workbook.Sheets['Courses Template'];

        if (!worksheet) {
            throw new Error('Worksheet "Courses Template" was not found.');
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
            worksheet,
            { defval: '' },
        );

        const coursesByCode = new Map(
            (
                await queryRunner.manager.getRepository(Course).find()
            ).map((course) => [
                String(course.code).trim().toUpperCase(),
                course,
            ]),
        );

        const desiredByCode = new Map<string, Department>();
        let blankCodes = 0;

        // Validate and build the complete update plan before writing anything.
        for (let index = 0; index < rows.length; index++) {
            const row = normalizeRow(rows[index]);
            const code = String(row.coursecode ?? '').trim().toUpperCase();

            if (!code) {
                console.warn(`Excel row ${index + 2}: missing CourseCode; skipped.`);
                continue;
            }

            const targetDepartment = mapDepartment(row.specializationcode);

            if (!targetDepartment) {
                blankCodes++;
                console.warn(
                    `Excel row ${index + 2}: ${code} has no Specialization Code; skipped.`,
                );
                continue;
            }

            const previous = desiredByCode.get(code);

            if (previous && previous !== targetDepartment) {
                throw new Error(
                    `Conflicting specialization codes for course ${code}. Aborting.`,
                );
            }

            desiredByCode.set(code, targetDepartment);
        }

        const changes: Array<{
            code: string;
            name: string;
            current: Department;
            target: Department;
        }> = [];

        let missingInDatabase = 0;

        for (const [code, target] of desiredByCode) {
            const course = coursesByCode.get(code);

            if (!course) {
                console.warn(`${code}: not found in database; skipped.`);
                missingInDatabase++;
                continue;
            }

            if (course.department === target) {
                continue;
            }

            changes.push({
                code,
                name: course.name,
                current: course.department,
                target,
            });
        }

        console.log('\n========== COURSE DEPARTMENT FIX ==========');
        console.log(`Excel rows: ${rows.length}`);
        console.log(`Courses with blank specialization codes: ${blankCodes}`);
        console.log(`Courses missing in database: ${missingInDatabase}`);
        console.log(`Planned department changes: ${changes.length}`);
        console.table(changes);

        if (!APPLY_CHANGES) {
            console.log(
                '\nDRY RUN ONLY. No database changes were made.',
            );
            console.log(
                'Review the output before enabling APPLY_COURSE_DEPARTMENT_FIX.',
            );
            return;
        }

        await queryRunner.startTransaction();

        try {
            const repository = queryRunner.manager.getRepository(Course);

            for (const change of changes) {
                const result = await repository.update(
                    { code: change.code },
                    { department: change.target },
                );

                if (result.affected !== 1) {
                    throw new Error(
                        `Expected to update exactly one course: ${change.code}; ` +
                        `affected rows: ${result.affected ?? 0}`,
                    );
                }

                console.log(
                    `Updated ${change.code}: ${change.current} -> ${change.target}`,
                );
            }

            await queryRunner.commitTransaction();

            console.log(
                `\nSuccessfully updated ${changes.length} course departments.`,
            );
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    } finally {
        await queryRunner.release();
        await app.close();
    }
}

main().catch((error: unknown) => {
    console.error('Course department fix failed:', error);
    process.exitCode = 1;
});