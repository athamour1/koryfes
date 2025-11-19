import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';

@Injectable()
export class BadgesService {
    constructor(
        @InjectRepository(Badge)
        private badgesRepository: Repository<Badge>,
    ) { }

    create(createBadgeDto: Partial<Badge>) {
        const badge = this.badgesRepository.create(createBadgeDto);
        return this.badgesRepository.save(badge);
    }

    findAll() {
        return this.badgesRepository.find();
    }

    findOne(id: number) {
        return this.badgesRepository.findOne({ where: { id } });
    }
}
