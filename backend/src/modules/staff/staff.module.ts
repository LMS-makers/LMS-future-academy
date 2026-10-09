import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity.js';
import { StaffService } from './staff.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}