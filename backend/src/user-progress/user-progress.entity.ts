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
import { ScoutDiploma } from '../scout-diplomas/scout-diploma.entity';
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

    @Column({ nullable: true })
    currentPeakId: number;

    @ManyToMany(() => Path)
    @JoinTable({
        name: 'user_completed_paths',
        joinColumn: { name: 'userProgressId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'pathId', referencedColumnName: 'id' },
    })
    completedPaths: Path[];

    @ManyToMany(() => ScoutDiploma)
    @JoinTable({
        name: 'user_scout_diplomas',
        joinColumn: { name: 'userProgressId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'scoutDiplomaId', referencedColumnName: 'id' },
    })
    scoutDiplomas: ScoutDiploma[];

    @ManyToMany(() => ElectiveDiploma)
    @JoinTable({
        name: 'user_elective_diplomas',
        joinColumn: { name: 'userProgressId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'electiveDiplomaId', referencedColumnName: 'id' },
    })
    electiveDiplomas: ElectiveDiploma[];
}
