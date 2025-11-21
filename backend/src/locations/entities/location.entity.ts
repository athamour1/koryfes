import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Unit } from '../../units/entities/unit.entity';

@Entity()
export class Location {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => User, (user) => user.location)
    users: User[];

    @OneToMany(() => Unit, (unit) => unit.location)
    units: Unit[];
}
