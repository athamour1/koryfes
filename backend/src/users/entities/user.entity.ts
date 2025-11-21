import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserBadge } from './user-badge.entity';
import { Location } from '../../locations/entities/location.entity';
import { Unit } from '../../units/entities/unit.entity';
import { UserProgress } from '../../user-progress/user-progress.entity';

export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    USER = 'user',
}

export enum UnitRole {
    LEADER = 'leader',
    DEPUTY_LEADER = 'deputy_leader',
    MEMBER = 'member',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Exclude()
    @Column()
    password?: string; // Optional because we might not select it by default

    @Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    // Legacy boolean, keeping for backward compatibility if needed, or we can remove it.
    // Let's keep it synced or remove it. The plan said "replaced/supplemented".
    // For simplicity, let's rely on role, but if existing code uses isAdmin, we might need a getter.
    @Column({ default: false })
    isAdmin: boolean;

    @ManyToOne(() => Location, (location) => location.users, { nullable: true, onDelete: 'SET NULL' })
    location: Location;

    @ManyToOne(() => Unit, (unit) => unit.users, { nullable: true, onDelete: 'SET NULL' })
    unit: Unit;

    @Column({
        type: 'simple-enum',
        enum: UnitRole,
        default: UnitRole.MEMBER,
        nullable: true,
    })
    unitRole: UnitRole;

    @Column({ nullable: true })
    profileImage: string;

    @Exclude()
    @Column({ nullable: true })
    resetPasswordToken: string;

    @Exclude()
    @Column({ nullable: true })
    resetPasswordExpires: Date;

    @OneToMany(() => UserBadge, (userBadge) => userBadge.user, { cascade: true })
    userBadges: UserBadge[];

    @OneToOne(() => UserProgress, (userProgress) => userProgress.user, { nullable: true })
    progress: UserProgress;
}

