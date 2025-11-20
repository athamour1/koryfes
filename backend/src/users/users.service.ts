import { Injectable, ConflictException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { BadgesService } from '../badges/badges.service';
import { LocationsService } from '../locations/locations.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private badgesService: BadgesService,
        private locationsService: LocationsService,
    ) { }

    async onModuleInit() {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminUsername && adminPassword) {
            const adminExists = await this.usersRepository.findOne({ where: { username: adminUsername } });
            if (!adminExists) {
                // Ensure Admin HQ location exists
                let adminLocation = await this.locationsService.findByName('Admin HQ');
                if (!adminLocation) {
                    adminLocation = await this.locationsService.create({ name: 'Admin HQ' });
                }

                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                const adminUser = this.usersRepository.create({
                    username: adminUsername,
                    password: hashedPassword,
                    location: adminLocation,
                    role: UserRole.SUPER_ADMIN,
                    isAdmin: true,
                });
                await this.usersRepository.save(adminUser);
                console.log(`Admin user '${adminUsername}' created.`);
            }
        }
    }

    async create(userData: Partial<User> & { locationName?: string }): Promise<User> {
        // Handle location lookup if provided as string name
        let locationEntity = userData.location;
        if (userData.locationName) {
            // Find or create location
            let location = await this.locationsService.findByName(userData.locationName);
            if (!location) {
                // Only Super Admin can create new locations implicitly? Or maybe just allow it for now.
                // Ideally, locations should be pre-created. But for flexibility let's allow create.
                location = await this.locationsService.create({ name: userData.locationName });
            }
            locationEntity = location; // Assign to locationEntity, not user.location yet
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = this.usersRepository.create({
            ...userData,
            password: hashedPassword,
            location: locationEntity,
            role: userData.role || UserRole.USER,
            isAdmin: userData.role === UserRole.SUPER_ADMIN || userData.role === UserRole.ADMIN
        });

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
        return this.usersRepository.findOne({ where: { username }, relations: ['badges', 'location'] });
    }

    async findOne(id: number): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { id }, relations: ['badges', 'location'] });
    }

    async findAll(locationId?: number, name?: string): Promise<User[]> {
        const where: any = {};
        // If we want to filter by location
        if (locationId) {
            where.location = { id: locationId };
        }
        if (name) {
            where.username = Like(`%${name}%`);
        }
        return this.usersRepository.find({ where, relations: ['badges', 'location'] });
    }

    async getAllIncludingAdmins(): Promise<User[]> {
        return this.usersRepository.find({ relations: ['badges', 'location'] });
    }

    async assignBadge(userId: number, badgeId: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['badges', 'location'] });
        const badge = await this.badgesService.findOne(badgeId);
        if (!user.badges) {
            user.badges = [];
        }
        user.badges.push(badge);
        await this.usersRepository.save(user);
        return this.findOne(userId);
    }

    async removeBadge(userId: number, badgeId: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['badges', 'location'] });
        if (user.badges) {
            user.badges = user.badges.filter(badge => badge.id !== badgeId);
            await this.usersRepository.save(user);
        }
        return this.findOne(userId);
    }

    async update(id: number, updateData: Partial<User> & { locationName?: string }): Promise<User> {
        if (updateData.locationName) {
            let loc = await this.locationsService.findByName(updateData.locationName);
            if (!loc) {
                loc = await this.locationsService.create({ name: updateData.locationName });
            }
            updateData.location = loc;
            delete updateData.locationName;
        }

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        await this.usersRepository.save({ ...updateData, id }); // Use save to handle relations properly or update with relation id
        // update() with relations is tricky in TypeORM. save() is safer if we have the ID.
        return this.findOne(id);
    }

    async updateProfileImage(id: number, imagePath: string): Promise<User> {
        await this.usersRepository.update(id, { profileImage: imagePath });
        return this.findOne(id);
    }

    async findByResetToken(token: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { resetPasswordToken: token } });
    }

    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }
}

