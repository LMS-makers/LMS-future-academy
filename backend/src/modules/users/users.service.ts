import {
    Injectable,
    NotFoundException,
    ConflictException,
    InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    /**
     * Create a new user. Throws ConflictException if the national ID already exists.
     * @param createUserDto - Data Transfer Object containing user creation data.
     * @returns The newly created user.
     * @throws ConflictException if the national ID is already registered.
     * @throws InternalServerErrorException for any other errors during user creation.
    */
    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByNationalId(createUserDto.nationalId);
        if (existingUser) {
            throw new ConflictException('National ID is already registered');
        }

        try {
            const newUser = this.usersRepository.create(createUserDto);
            return await this.usersRepository.save(newUser);
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while creating the user');
        }
    }

    /**
     * Retrieve all users from the database.
     * @returns An array of all users.
     */
    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    /**
     * Find a user by their national ID.
     * @param nationalId - The national ID to search for.
     * @returns The user if found, otherwise null.
     */
    async findByNationalId(nationalId: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { nationalId } });
        if (!user) {
            throw new NotFoundException(`User not found with National ID: ${nationalId}`);
        }
        return user;
    }

    /**
     * Find a user by their ID.
     * @param id - The ID to search for.
     * @returns The user if found, otherwise null.
     */
    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User not found with ID: ${id}`);
        }
        return user;
    }


    /**
     * Update a user's information.
     * @param id - The ID of the user to update.
     * @param updateUserDto - Data Transfer Object containing updated user data.
     * @returns The updated user.
     * @throws NotFoundException if the user is not found.
     */
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);

        // Check if the national ID is being updated and if it already exists for another user
        if (updateUserDto.nationalId && updateUserDto.nationalId !== user.nationalId) {
            const existingUser = await this.findByNationalId(updateUserDto.nationalId);
            if (existingUser) {
                throw new ConflictException('Updated national ID is already registered to another user');
            }
        }

        // Merge the new data with the existing user and save it
        const updatedUser = this.usersRepository.merge(user, updateUserDto);
        return this.usersRepository.save(updatedUser);
    }

    /**
     * Deactivate a user's account (Soft Delete / Deactivation)
     * We do not delete the record from the database to preserve student submissions and evaluations
     */
    async deactivate(id: string): Promise<void> {
        const user = await this.findById(id);
        user.isActive = false;
        await this.usersRepository.save(user);
    }


    /**
     * Activate a user's account
     * @param id - The ID of the user to activate.
     * @returns void
    */
    async activateUser(id: string): Promise<void> {
        const user = await this.findById(id);
        user.isActive = true;
        await this.usersRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { phone } });
    }
}