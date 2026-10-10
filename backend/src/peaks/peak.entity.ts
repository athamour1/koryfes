import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PeakType } from './peak-type.enum';

// Rows come from the fixed catalog (src/catalog); never edited at runtime
@Entity('peaks')
export class Peak {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column({
        type: 'simple-enum',
        enum: PeakType,
        unique: true,
    })
    type: PeakType;

    @Column('text', { nullable: true })
    description: string;

    @Column()
    order: number;
}
