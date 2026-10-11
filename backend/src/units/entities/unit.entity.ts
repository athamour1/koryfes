import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { UnitPhoto } from './unit-photo.entity';

@Entity()
export class Unit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    flag: string;

    @Index('IDX_unit_locationId')
    @ManyToOne(() => Location, (location) => location.units, { onDelete: 'CASCADE' })
    location: Location;

    @OneToMany(() => User, (user) => user.unit)
    users: User[];

    @OneToMany(() => UnitPhoto, (photo) => photo.unit)
    photos: UnitPhoto[];
}
