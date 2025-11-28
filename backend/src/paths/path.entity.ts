import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PathCategory } from './path-category.enum';

@Entity('paths')
export class Path {
    @PrimaryGeneratedColumn()
    id: number;

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
