import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { UnitRole, UserRole } from '../entities/user.entity';

export class EntityRefDto {
    @IsInt()
    id: number;
}

/**
 * POST /users (admin / super admin).
 */
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsString()
    locationName?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => EntityRefDto)
    location?: EntityRefDto;

    @IsOptional()
    @IsInt()
    unitId?: number | null;

    @IsOptional()
    @IsEnum(UnitRole)
    unitRole?: UnitRole | null;

    @IsOptional()
    @IsObject()
    avatarConfig?: Record<string, any>;
}

/**
 * PATCH /users/:id (admin / super admin). Admins are further restricted in
 * the controller; only super admins may change role or location.
 */
export class AdminUpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    username?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    password?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsString()
    locationName?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => EntityRefDto)
    unit?: EntityRefDto | null;

    @IsOptional()
    @IsEnum(UnitRole)
    unitRole?: UnitRole | null;

    @IsOptional()
    @IsObject()
    avatarConfig?: Record<string, any>;
}

/**
 * PATCH /users/profile (any logged-in user, on themselves).
 */
export class UpdateProfileDto {
    @IsOptional()
    @IsObject()
    avatarConfig?: Record<string, any>;
}
