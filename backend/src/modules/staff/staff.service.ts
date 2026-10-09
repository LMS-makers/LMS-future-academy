import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity.js';

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,
    ) { }

    async findOne(id: string): Promise<Staff> {
        const staff = await this.staffRepository.findOne({
            where: { id },
        });
        if (!staff) {
            throw new NotFoundException(`Staff member with id "${id}" not found.`);
        }
        return staff;
    }
}
