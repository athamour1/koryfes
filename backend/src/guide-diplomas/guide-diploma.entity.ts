import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('guide_diplomas')
export class GuideDiploma {
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
