import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Peak } from '../peaks/peak.entity';
import { Path } from '../paths/path.entity';
import { GuideDiploma } from '../guide-diplomas/guide-diploma.entity';
import { ElectiveDiploma } from '../elective-diplomas/elective-diploma.entity';

@Entity('user_progress')
export class UserProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.progress, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ unique: true })
    userId: number;

    @ManyToOne(() => Peak, { nullable: true })
    @JoinColumn({ name: 'currentPeakId' })
    currentPeak: Peak | null;

    @Column({ type: 'int', nullable: true })
    currentPeakId: number | null;

    // What the Guide has already been congratulated on (the app shows a
    // celebration for anything newer): the highest peak, by order (0 = none),
    // and the elective diplomas held at that moment
    @Column({ type: 'int', default: 0 })
    celebratedPeakOrder: number;

    @Column({ type: 'simple-json', nullable: true })
    celebratedElectiveIds: number[] | null;

    @ManyToMany(() => Path)
    @JoinTable({
        name: 'user_completed_paths',
        joinColumn: { name: 'userProgressId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'pathId', referencedColumnName: 'id' },
    })
    completedPaths: Path[];

    @ManyToMany(() => GuideDiploma)
    @JoinTable({
        name: 'user_guide_diplomas',
        joinColumn: { name: 'userProgressId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'guideDiplomaId', referencedColumnName: 'id' },
    })
    guideDiplomas: GuideDiploma[];

    @ManyToMany(() => ElectiveDiploma)
    @JoinTable({
        name: 'user_elective_diplomas',
        joinColumn: { name: 'userProgressId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'electiveDiplomaId', referencedColumnName: 'id' },
    })
    electiveDiplomas: ElectiveDiploma[];
}
