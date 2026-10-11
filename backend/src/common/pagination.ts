import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { SelectQueryBuilder } from 'typeorm';

export const MAX_PAGE_SIZE = 100;

/**
 * Query of a paged list. Without `page` the endpoint keeps returning the
 * whole list (dropdowns and stats still need it); with it, one page.
 */
export class PageQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(MAX_PAGE_SIZE)
    limit?: number;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    sortBy?: string;

    // query strings carry booleans as text
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true')
    @IsBoolean()
    descending?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;
}

export interface Page<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

/**
 * Applies sorting (only columns listed in `sortable`, then by id so pages
 * never overlap) and, when a page is asked for, skip/take with the total.
 */
export async function paginate<T>(
    qb: SelectQueryBuilder<T>,
    query: PageQueryDto,
    sortable: Record<string, string>,
    defaultSort: string,
): Promise<T[] | Page<T>> {
    const column = sortable[query.sortBy] ?? sortable[defaultSort];
    qb.orderBy(column, query.descending ? 'DESC' : 'ASC').addOrderBy(`${qb.alias}.id`, 'ASC');

    if (!query.page) {
        return qb.getMany();
    }
    const limit = query.limit ?? 20;
    const [items, total] = await qb
        .skip((query.page - 1) * limit)
        .take(limit)
        .getManyAndCount();
    return { items, total, page: query.page, limit };
}

/** `%term%` for LIKE, with the term's own wildcards taken literally */
export function likeTerm(search: string): string {
    return `%${search.trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
