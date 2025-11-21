import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Badge } from '../../badges/entities/badge.entity';

@Entity()
export class UserBadge {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    acquiredAt: Date;

    @ManyToOne(() => User, (user) => user.userBadges, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Badge, (badge) => badge.userBadges, { onDelete: 'CASCADE' })
    badge: Badge;
}
