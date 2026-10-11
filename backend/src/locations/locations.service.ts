import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location, LocationType } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { User, UserRole } from '../users/entities/user.entity';

import { Unit } from '../units/entities/unit.entity';
import { StorageService } from '../storage/storage.service';
import { deleteQuietly } from '../storage/delete-quietly';
import { keyFromUploadPath, unitFlagKey } from '../storage/upload-paths';
@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private locationsRepository: Repository<Location>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private readonly storage: StorageService,
    ) { }

    async create(createLocationDto: CreateLocationDto): Promise<Location> {
        const { name, type, latitude, longitude } = createLocationDto;
        const existing = await this.locationsRepository.findOne({ where: { name } });
        if (existing) {
            throw new ConflictException('Location already exists');
        }
        const location = this.locationsRepository.create({
            name,
            type: type || LocationType.GUIDES,
            latitude,
            longitude,
        });
        return this.locationsRepository.save(location);
    }

    async findAll(): Promise<Location[]> {
        return this.locationsRepository.find();
    }

    async findOne(id: number): Promise<Location> {
        const location = await this.locationsRepository.findOne({ where: { id } });
        if (!location) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
        return location;
    }

    /**
     * Read-only view of a local group for any signed-in user: its units with
     * how many members each has, and how many Guides the group has.
     */
    async overview(id: number) {
        const location = await this.findOne(id);
        const units = await this.locationsRepository.manager.find(Unit, {
            where: { location: { id } },
            relations: ['users'],
            order: { name: 'ASC' },
        });
        const guideCount = await this.usersRepository.count({ where: { location: { id }, role: UserRole.USER } });
        return {
            id: location.id,
            name: location.name,
            type: location.type,
            guideCount,
            units: units.map((unit) => ({
                id: unit.id,
                name: unit.name,
                flag: unit.flag,
                memberCount: (unit.users || []).length,
            })),
        };
    }

    async findByName(name: string): Promise<Location> {
        return this.locationsRepository.findOne({ where: { name } });
    }

    async update(id: number, updateLocationDto: UpdateLocationDto): Promise<Location> {
        const location = await this.findOne(id);
        const oldType = location.type;

        // Update fields
        if (updateLocationDto.name) {
            location.name = updateLocationDto.name;
        }
        if (updateLocationDto.type !== undefined) {
            location.type = updateLocationDto.type;
        }
        if (updateLocationDto.latitude !== undefined) {
            location.latitude = updateLocationDto.latitude;
        }
        if (updateLocationDto.longitude !== undefined) {
            location.longitude = updateLocationDto.longitude;
        }

        const updatedLocation = await this.locationsRepository.save(location);

        // If type changed, update all users' scarf colors
        if (updateLocationDto.type !== undefined && oldType !== updateLocationDto.type) {
            await this.updateUsersScarf(id, updateLocationDto.type);
        }

        return updatedLocation;
    }

    async remove(id: number): Promise<void> {
        // units and their photo rows go by cascade; their stored images don't
        const units = await this.locationsRepository.manager.find(Unit, {
            where: { location: { id } },
            relations: ['photos'],
        });
        const keys = units.flatMap((unit) => [unitFlagKey(unit.flag), ...(unit.photos || []).map((p) => keyFromUploadPath(p.path))]);

        const result = await this.locationsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
        await deleteQuietly(this.storage, keys);
    }

    /**
     * Update scarf color for all users in a location based on location type
     */
    private async updateUsersScarf(locationId: number, locationType: LocationType): Promise<void> {
        const scarfColor = locationType === LocationType.NAVAL_GUIDES ? 'navy' : 'light-blue';

        const users = await this.usersRepository.find({
            where: { location: { id: locationId } },
        });

        for (const user of users) {
            if (user.avatarConfig) {
                user.avatarConfig.scarfColor = scarfColor;
            } else {
                // Initialize avatarConfig if it doesn't exist
                user.avatarConfig = { scarfColor };
            }
            await this.usersRepository.save(user);
        }
    }

    /**
     * Get default scarf color based on location type
     */
    getDefaultScarfColor(locationType: LocationType): string {
        return locationType === LocationType.NAVAL_GUIDES ? 'navy' : 'light-blue';
    }
}
