import { IsIn, IsInt, IsOptional } from 'class-validator';

export class AwardPathDto {
    @IsInt()
    pathId: number;
}

export class AwardDiplomaDto {
    @IsInt()
    diplomaId: number;

    @IsOptional()
    @IsIn(['guide', 'elective'])
    type?: 'guide' | 'elective';
}
