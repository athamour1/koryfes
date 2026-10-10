import { UnauthorizedException } from '@nestjs/common';
import { Unit } from './entities/unit.entity';

export interface UnitEditor {
    role: string;
    locationId?: number;
    unitId?: number;
    unitRole?: string;
}

/**
 * Who may change a unit's flag, yell and photos: a super admin, the admin of
 * the unit's location, or the unit's own leader.
 */
export function assertCanEditUnit(user: UnitEditor, unit: Unit): void {
    if (user.role === 'super_admin') return;
    if (user.role === 'admin' && user.locationId != null && unit.location?.id === user.locationId) return;
    if (user.role === 'user' && user.unitId === unit.id && user.unitRole === 'leader') return;
    throw new UnauthorizedException('You do not have permission to edit this unit');
}
