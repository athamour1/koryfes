import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Badge } from '../../badges/entities/badge.entity';
import { Location } from '../../locations/entities/location.entity';

export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

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

    @Column({ nullable: true })
    profileImage: string;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ nullable: true })
    resetPasswordExpires: Date;

    @ManyToMany(() => Badge, (badge) => badge.users)
    @JoinTable()
    badges: Badge[];
}

