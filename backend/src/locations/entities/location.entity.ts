import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Unit } from '../../units/entities/unit.entity';

export enum LocationType {
    GUIDES = 'guides',
    NAVAL_GUIDES = 'naval-guides',
}

@Entity()
export class Location {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({
        type: 'simple-enum',
        enum: LocationType,
        default: LocationType.GUIDES,
    })
    type: LocationType;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => User, (user) => user.location)
    users: User[];

    @OneToMany(() => Unit, (unit) => unit.location)
    units: Unit[];
}
