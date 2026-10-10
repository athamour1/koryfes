import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Unit } from './unit.entity';

export type UnitPhotoKind = 'corner' | 'activity';
export const UNIT_PHOTO_KINDS: UnitPhotoKind[] = ['corner', 'activity'];
export const MAX_ACTIVITY_PHOTOS = 9;

/** A unit's gallery: one photo of its corner and up to 9 of its activities. */
@Entity()
export class UnitPhoto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'simple-enum', enum: UNIT_PHOTO_KINDS })
    kind: UnitPhotoKind;

    @Column()
    path: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Unit, (unit) => unit.photos, { onDelete: 'CASCADE' })
    unit: Unit;
}
