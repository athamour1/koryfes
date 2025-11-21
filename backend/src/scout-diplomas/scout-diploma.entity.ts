import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('scout_diplomas')
export class ScoutDiploma {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    level: number; // 1, 2, or 3

    @Column({ nullable: true })
    image: string;

    @Column('text', { nullable: true })
    description: string;
}
