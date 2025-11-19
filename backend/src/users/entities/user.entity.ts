import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Badge } from '../../badges/entities/badge.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password?: string; // Optional because we might not select it by default

    @Column()
    location: string;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ nullable: true })
    profileImage: string;

    @ManyToMany(() => Badge, (badge) => badge.users)
    @JoinTable()
    badges: Badge[];
}
