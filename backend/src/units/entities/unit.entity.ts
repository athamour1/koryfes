import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';

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

    @ManyToOne(() => Location, (location) => location.units, { onDelete: 'CASCADE' })
    location: Location;

    @OneToMany(() => User, (user) => user.unit)
    users: User[];
}
