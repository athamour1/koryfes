import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private locationsRepository: Repository<Location>,
    ) { }

    async create(createLocationDto: CreateLocationDto): Promise<Location> {
        const { name } = createLocationDto;
        const existing = await this.locationsRepository.findOne({ where: { name } });
        if (existing) {
            throw new ConflictException('Location already exists');
        }
        const location = this.locationsRepository.create({ name });
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

    async findByName(name: string): Promise<Location> {
        return this.locationsRepository.findOne({ where: { name } });
    }

    async update(id: number, updateLocationDto: UpdateLocationDto): Promise<Location> {
        const location = await this.findOne(id);
        if (updateLocationDto.name) {
            location.name = updateLocationDto.name;
        }
        return this.locationsRepository.save(location);
    }

    async remove(id: number): Promise<void> {
        const result = await this.locationsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
    }
}
