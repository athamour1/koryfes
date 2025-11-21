import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('elective_diplomas')
export class ElectiveDiploma {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    image: string;

    @Column('text', { nullable: true })
    description: string;
}
