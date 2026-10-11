import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PageQueryDto } from '../../common/pagination';

/** GET /units: paging plus the location filter (forced for admins and users) */
export class UnitsQueryDto extends PageQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    locationId?: number;
}
