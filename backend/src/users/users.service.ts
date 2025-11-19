import { Injectable, ConflictException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { BadgesService } from '../badges/badges.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private badgesService: BadgesService,
    ) { }

    async onModuleInit() {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminUsername && adminPassword) {
            const adminExists = await this.usersRepository.findOne({ where: { username: adminUsername } });
            if (!adminExists) {
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                const adminUser = this.usersRepository.create({
                    username: adminUsername,
                    password: hashedPassword,
                    location: 'Admin HQ',
                    isAdmin: true,
                });
                await this.usersRepository.save(adminUser);
                console.log(`Admin user '${adminUsername}' created.`);
            }
        }
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        try {
            return await this.usersRepository.save(user);
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new ConflictException('Username already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    async findByUsername(username: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { username }, relations: ['badges'] });
    }

    async findOne(id: number): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { id }, relations: ['badges'] });
    }

    async findAll(location?: string, name?: string): Promise<User[]> {
        const where: any = { isAdmin: false };
        if (location) {
            where.location = Like(`%${location}%`);
        }
        if (name) {
            where.username = Like(`%${name}%`);
        }
        return this.usersRepository.find({ where, relations: ['badges'] });
    }

    async getAllIncludingAdmins(): Promise<User[]> {
        return this.usersRepository.find({ relations: ['badges'] });
    }

    async assignBadge(userId: number, badgeId: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['badges'] });
        const badge = await this.badgesService.findOne(badgeId);
        if (!user.badges) {
            user.badges = [];
        }
        user.badges.push(badge);
        await this.usersRepository.save(user);
        return this.findOne(userId);
    }

    async removeBadge(userId: number, badgeId: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['badges'] });
        if (user.badges) {
            user.badges = user.badges.filter(badge => badge.id !== badgeId);
            await this.usersRepository.save(user);
        }
        return this.findOne(userId);
    }

    async update(id: number, updateData: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, updateData);
        return this.findOne(id);
    }

    async updateProfileImage(id: number, imagePath: string): Promise<User> {
        await this.usersRepository.update(id, { profileImage: imagePath });
        return this.findOne(id);
    }
}
