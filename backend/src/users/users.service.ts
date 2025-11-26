import { Injectable, ConflictException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole, UnitRole } from './entities/user.entity';
import { LocationsService } from '../locations/locations.service';
import * as bcrypt from 'bcrypt';

import { generateRandomAvatarConfig } from './avatar.utils';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
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
                    avatarConfig: generateRandomAvatarConfig(),
                });
                await this.usersRepository.save(adminUser);
                console.log(`Admin user '${adminUsername}' created.`);
            }
        }
    }

    async create(userData: Partial<User> & { locationName?: string }): Promise<any> {
        // Handle location lookup if provided as string name
        // Handle location lookup if provided as string name
        let locationEntity = userData.location || null;
        if (userData.locationName) {
            // Find or create location
            let location = await this.locationsService.findByName(userData.locationName);
            if (!location) {
                location = await this.locationsService.create({ name: userData.locationName });
            }
            locationEntity = location;
        }

        // Hash password if provided and not already hashed
        if (userData.password && !userData.password.startsWith('$2b$')) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        // Generate avatar config with appropriate scarf color based on location type
        let avatarConfig = userData.avatarConfig || generateRandomAvatarConfig();
        if (locationEntity && !userData.avatarConfig) {
            // Set scarf color based on location type
            const scarfColor = this.locationsService.getDefaultScarfColor(locationEntity.type);
            avatarConfig.scarfColor = scarfColor;
        }

        const user = this.usersRepository.create({
            ...userData,
            location: locationEntity,
            role: userData.role || UserRole.USER,
            isAdmin: userData.role === UserRole.SUPER_ADMIN || userData.role === UserRole.ADMIN,
            avatarConfig,
        });

        // Enforce unique Leader/Deputy Leader per unit
        let demotedUser = null;
        if (user.unit && user.unitRole) {
            demotedUser = await this.ensureUniqueUnitRole(user.unit.id, user.unitRole);
        }

        try {
            const savedUser = await this.usersRepository.save(user);
            return {
                user: savedUser,
                demotedUser
            };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new ConflictException('Username already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    async findByUsername(username: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({
            where: { username },
            relations: [
                'location',
                'unit',
                'progress',
                'progress.currentPeak',
                'progress.completedPaths',
                'progress.guideDiplomas',
                'progress.electiveDiplomas'
            ]
        });
        return user;
    }

    async findOne(id: number): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: [
                'location',
                'unit',
                'progress',
                'progress.currentPeak',
                'progress.completedPaths',
                'progress.guideDiplomas',
                'progress.electiveDiplomas'
            ]
        });
        return user;
    }

    async findAll(locationId?: number, name?: string): Promise<User[]> {
        const where: any = {};
        if (locationId) {
            where.location = { id: locationId };
        }
        if (name) {
            where.username = Like(`%${name}%`);
        }
        const users = await this.usersRepository.find({
            where,
            relations: [
                'location',
                'unit',
                'progress',
                'progress.currentPeak',
                'progress.completedPaths',
                'progress.guideDiplomas',
                'progress.electiveDiplomas'
            ]
        });
        return users;
    }

    async getAllIncludingAdmins(): Promise<User[]> {
        const users = await this.usersRepository.find({
            relations: ['location']
        });
        return users;
    }



    async update(id: number, updateData: Partial<User> & { locationName?: string }): Promise<any> {
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

        // Enforce unique Leader/Deputy Leader per unit
        let demotedUser = null;
        if (updateData.unit && updateData.unitRole) {
            demotedUser = await this.ensureUniqueUnitRole(updateData.unit.id, updateData.unitRole, id);
        }

        await this.usersRepository.save({ ...updateData, id });
        const user = await this.findOne(id);

        return {
            user,
            demotedUser
        };
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

    // Ensure only one Leader and one Deputy Leader per unit
    private async ensureUniqueUnitRole(
        unitId: number,
        newRole: UnitRole,
        excludeUserId?: number
    ): Promise<{ id: number; username: string; role: string } | null> {
        if (newRole === UnitRole.LEADER || newRole === UnitRole.DEPUTY_LEADER) {
            // Find existing user with this role in the unit
            const existingUser = await this.usersRepository.findOne({
                where: {
                    unit: { id: unitId },
                    unitRole: newRole
                }
            });

            if (existingUser && existingUser.id !== excludeUserId) {
                // Demote to member
                const demotedInfo = {
                    id: existingUser.id,
                    username: existingUser.username,
                    role: newRole
                };

                existingUser.unitRole = UnitRole.MEMBER;
                await this.usersRepository.save(existingUser);
                console.log(`Demoted user ${existingUser.id} from ${newRole} to MEMBER in unit ${unitId}`);

                return demotedInfo;
            }
        }
        return null;
    }
}

