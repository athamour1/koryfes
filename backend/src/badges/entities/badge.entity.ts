import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserBadge } from '../../users/entities/user-badge.entity';

@Entity()
export class Badge {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    image: string; // URL or path to image

    @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
    userBadges: UserBadge[];
}
