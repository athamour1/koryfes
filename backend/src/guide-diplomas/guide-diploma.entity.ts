import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { CatalogRequirement } from '../catalog/catalog.types';

// Rows come from the fixed catalog (src/catalog); never edited at runtime
@Entity('guide_diplomas')
export class GuideDiploma {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({ unique: true })
    level: number; // 1, 2, or 3

    @Column({ type: 'simple-json' })
    requirements: CatalogRequirement[];
}
