import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PeakType } from './peak-type.enum';

@Entity('peaks')
export class Peak {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: PeakType,
        unique: true,
    })
    type: PeakType;

    @Column({ nullable: true })
    image: string;

    @Column('text', { nullable: true })
    description: string;

    @Column()
    order: number;
}
