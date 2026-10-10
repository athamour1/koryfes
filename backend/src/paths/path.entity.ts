import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PathCategory } from './path-category.enum';

// Rows come from the fixed catalog (src/catalog); never edited at runtime
@Entity('paths')
export class Path {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    number: number;

    @Column()
    name: string;

    @Column({
        type: 'simple-enum',
        enum: PathCategory,
    })
    category: PathCategory;

    @Column('text', { nullable: true })
    description: string;
}
