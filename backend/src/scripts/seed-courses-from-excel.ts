import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import XLSX from 'xlsx';
import { resolve } from 'node:path';
import { AppModule } from '../app.module.js';
import { Course } from '../modules/courses/entities/course.entity.js';
import { CreditHours, Department } from '../common/enums.js';

type ExcelRow = Record<string, unknown>;

type CourseInput = {
    code: string;
    name: string;
    department: Department;
    creditHours: CreditHours;
    isActive: boolean;
};

const EXCEL_PATH = resolve(
    process.cwd(),
    'src/data/Course_Import_Last.xlsx',
);

function normalizeHeader(header: string): string {
    return header
        .replace(/\([^)]*\)/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
}

function normalizeRow(row: ExcelRow): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
            normalizeHeader(key),
            value,
        ]),
    );
}

function getText(value: unknown): string {
    return String(value ?? '').trim();
}

function mapDepartment(value: unknown): Department {
    const normalized = getText(value)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const departments: Record<string, Department> = {
        general: Department.GENERAL,
        cs: Department.CS,
        it: Department.IT,
        is: Department.IS,
        computercience: Department.CS,
        computerscience: Department.CS,
        informationtechnology: Department.IT,
        informationsystems: Department.IS,
    };

    // "Computer Science (General)" represents the general department.
    if (
        normalized === 'computersciencegeneral' ||
        normalized === 'computersciencegeneraldepartment'
    ) {
        return Department.GENERAL;
    }

    const department = departments[normalized];

    if (!department) {
        throw new Error(`Unknown department: "${getText(value)}"`);
    }

    return department;
}

function mapCreditHours(value: unknown): CreditHours {
    const credits = Number(value);

    const validCredits = [1, 2, 3, 4];

    if (!Number.isInteger(credits) || !validCredits.includes(credits)) {
        throw new Error(`Invalid credit hours: "${getText(value)}"`);
    }

    return credits as CreditHours;
}

function mapIsActive(value: unknown): boolean {
    const normalized = getText(value).toLowerCase();

    if (['yes', 'true', '1', 'active'].includes(normalized)) {
        return true;
    }

    if (['no', 'false', '0', 'inactive'].includes(normalized)) {
        return false;
    }

    if (normalized === '') {
        return true;
    }

    throw new Error(`Invalid IsActive value: "${normalized}"`);
}

function mapCourse(row: ExcelRow): CourseInput {
    const data = normalizeRow(row);

    const code = getText(data.coursecode);
    const name = getText(data.coursename);

    if (!code) {
        throw new Error('CourseCode is required.');
    }

    if (!name) {
        throw new Error('CourseName is required.');
    }

    return {
        code,
        name,
        department: mapDepartment(data.departmentname),
        creditHours: mapCreditHours(data.credits),
        isActive: mapIsActive(data.isactive),
    };
}

async function bootstrap() {
    console.log('📚 Starting Excel Courses Import...');
    console.log(`📄 Excel file: ${EXCEL_PATH}`);

    const dryRun = process.env.DRY_RUN === 'true';
    const app = await NestFactory.createApplicationContext(AppModule);
    const queryRunner = app.get(DataSource).createQueryRunner();

    let transactionStarted = false;

    try {
        const workbook = XLSX.readFile(EXCEL_PATH);

        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
            throw new Error('The Excel workbook has no worksheets.');
        }

        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
            defval: '',
        });

        if (rows.length === 0) {
            throw new Error(`Worksheet "${sheetName}" contains no data.`);
        }

        console.log(`📋 Worksheet: ${sheetName}`);
        console.log(`📦 Rows found: ${rows.length}`);
        console.log(`🧪 Dry run: ${dryRun ? 'YES' : 'NO'}`);

        await queryRunner.connect();
        await queryRunner.startTransaction();
        transactionStarted = true;

        const repository = queryRunner.manager.getRepository(Course);

        const existingCourses = await repository.find({
            select: { code: true },
        });

        const existingCodes = new Set(
            existingCourses.map((course) => course.code.toLowerCase()),
        );

        const processedCodes = new Set<string>();

        let inserted = 0;
        let skipped = 0;
        let invalid = 0;

        for (let index = 0; index < rows.length; index++) {
            const excelRow = index + 2;

            try {
                const course = mapCourse(rows[index]);
                const normalizedCode = course.code.toLowerCase();

                if (processedCodes.has(normalizedCode)) {
                    skipped++;
                    console.warn(
                        `⏭️ Row ${excelRow}: Duplicate code in Excel "${course.code}"`,
                    );
                    continue;
                }

                processedCodes.add(normalizedCode);

                if (existingCodes.has(normalizedCode)) {
                    skipped++;
                    console.warn(
                        `⏭️ Row ${excelRow}: Course "${course.code}" already exists`,
                    );
                    continue;
                }

                if (!dryRun) {
                    await repository.save(repository.create(course));
                }

                existingCodes.add(normalizedCode);
                inserted++;

                console.log(
                    `${dryRun ? '🔎' : '✅'} ${course.code} - ${course.name}`,
                );
            } catch (error) {
                invalid++;

                const message =
                    error instanceof Error ? error.message : String(error);

                console.error(`❌ Row ${excelRow}: ${message}`);
            }
        }

        if (dryRun) {
            await queryRunner.rollbackTransaction();
        } else {
            await queryRunner.commitTransaction();
        }

        transactionStarted = false;

        console.log('\n========== Import Summary ==========');
        console.log(`📦 Total Excel rows: ${rows.length}`);
        console.log(`✅ ${dryRun ? 'Would insert' : 'Inserted'}: ${inserted}`);
        console.log(`⏭️ Skipped: ${skipped}`);
        console.log(`❌ Invalid rows: ${invalid}`);
        console.log(`🧪 Dry run: ${dryRun}`);
        console.log('====================================\n');

        if (invalid > 0) {
            console.warn(
                '⚠️ Some rows were invalid. Review the errors above.',
            );
        }
    } catch (error) {
        if (transactionStarted) {
            await queryRunner.rollbackTransaction();
            transactionStarted = false;
        }

        console.error('❌ Courses import failed:', error);
        process.exitCode = 1;
    } finally {
        if (queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction();
        }

        if (queryRunner.isReleased === false) {
            await queryRunner.release();
        }

        await app.close();
    }
}

bootstrap().catch((error) => {
    console.error('❌ Unexpected import error:', error);
    process.exitCode = 1;
});