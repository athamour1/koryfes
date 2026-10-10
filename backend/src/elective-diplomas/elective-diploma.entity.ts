import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CatalogRequirement } from '../catalog/catalog.types';

// Rows come from the fixed catalog (src/catalog); never edited at runtime
@Entity('elective_diplomas')
export class ElectiveDiploma {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    number: number;

    @Column()
    name: string;

    @Column('text', { nullable: true })
    intro: string | null;

    @Column({ type: 'simple-json' })
    requirements: CatalogRequirement[];
}
