import { Injectable, ConflictException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UnitRole } from './entities/user.entity';
import { Unit } from '../units/entities/unit.entity';
import { LocationsService } from '../locations/locations.service';
import { assertPasswordPolicy } from '../common/password-policy';
import { likeTerm, Page, paginate } from '../common/pagination';
import { UsersQueryDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

import { generateRandomAvatarConfig } from './avatar.utils';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Unit)
        private unitsRepository: Repository<Unit>,
        private locationsService: LocationsService,
    ) { }

    async onModuleInit() {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminUsername && adminPassword) {
            // The super admin password is reset from the env on every boot, so
            // a weak one must stop the boot rather than silently go live
            try {
                assertPasswordPolicy(adminPassword);
            } catch (e) {
                throw new Error(`ADMIN_PASSWORD rejected: ${e.message}`);
            }

            let adminUser = await this.usersRepository.findOne({ where: { username: adminUsername } });

            if (!adminUser) {
                // Ensure Admin HQ location exists
                let adminLocation = await this.locationsService.findByName('Admin HQ');
                if (!adminLocation) {
                    adminLocation = await this.locationsService.create({ name: 'Admin HQ' });
                }

                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                adminUser = this.usersRepository.create({
                    username: adminUsername,
                    password: hashedPassword,
                    location: adminLocation,
                    role: UserRole.SUPER_ADMIN,
                    isAdmin: true,
                    avatarConfig: generateRandomAvatarConfig(),
                });
                await this.usersRepository.save(adminUser);
                console.log(`Admin user '${adminUsername}' created.`);
            } else {
                // Update password to match environment variable
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                adminUser.password = hashedPassword;
                await this.usersRepository.save(adminUser);
                console.log(`Admin user '${adminUsername}' password updated from environment variable.`);
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

        if (userData.password) {
            assertPasswordPolicy(userData.password);
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
            // SQLite and Postgres unique-violation codes
            if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
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

    /**
     * Users for lists: progress comes as counts (pathCount, guideDiplomaCount,
     * electiveDiplomaCount), not as the awarded rows, so the query doesn't
     * multiply every user by paths × diplomas.
     */
    async findAll(query: UsersQueryDto): Promise<User[] | Page<User>> {
        const qb = this.usersRepository
            .createQueryBuilder('u')
            .leftJoinAndSelect('u.location', 'location')
            .leftJoinAndSelect('u.unit', 'unit')
            .leftJoinAndSelect('u.progress', 'progress')
            .leftJoinAndSelect('progress.currentPeak', 'currentPeak')
            .loadRelationCountAndMap('progress.pathCount', 'progress.completedPaths')
            .loadRelationCountAndMap('progress.guideDiplomaCount', 'progress.guideDiplomas')
            .loadRelationCountAndMap('progress.electiveDiplomaCount', 'progress.electiveDiplomas');

        if (query.locationId) {
            qb.andWhere('location.id = :locationId', { locationId: query.locationId });
        }
        if (query.unitId) {
            qb.andWhere('unit.id = :unitId', { unitId: query.unitId });
        }
        if (query.role) {
            qb.andWhere('u.role = :role', { role: query.role });
        }
        if (query.unitRole) {
            qb.andWhere('u.unitRole = :unitRole', { unitRole: query.unitRole });
        }
        if (query.search?.trim()) {
            qb.andWhere(`LOWER(u.username) LIKE :search ESCAPE '\\'`, { search: likeTerm(query.search) });
        }

        return paginate(qb, query, {
            username: 'u.username',
            role: 'u.role',
            location: 'location.name',
            unit: 'unit.name',
            unitRole: 'u.unitRole',
        }, 'username');
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
            assertPasswordPolicy(updateData.password);
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // Keep the legacy isAdmin flag in sync with role
        if (updateData.role) {
            updateData.isAdmin = updateData.role === UserRole.SUPER_ADMIN || updateData.role === UserRole.ADMIN;
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



    async findByResetToken(tokenHash: string): Promise<User | null> {
        // An undefined value in a TypeORM where clause matches every row
        if (!tokenHash) {
            return null;
        }
        return this.usersRepository.findOne({ where: { resetPasswordToken: tokenHash } });
    }

    async getUnitLocationId(unitId: number): Promise<number | undefined> {
        const unit = await this.unitsRepository.findOne({
            where: { id: unitId },
            relations: ['location'],
        });
        return unit?.location?.id;
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

