import { IsNumber, IsString, IsEnum } from 'class-validator';

export class CreateUserProgressDto {
    @IsNumber()
    userId: number;
}

export class AwardPathDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    pathId: number;
}

export class AwardDiplomaDto {
    @IsNumber()
    userId: number;

    @IsNumber()
    diplomaId: number;

    @IsString()
    @IsEnum(['guide', 'elective'])
    type: 'guide' | 'elective';
}

export class UserProgressResponseDto {
    id: number;
    userId: number;
    currentPeakId: number;
    currentPeak?: {
        id: number;
        name: string;
        type: string;
        order: number;
    };
    completedPaths: Array<{
        id: number;
        name: string;
        category: string;
    }>;
    guideDiplomas: Array<{
        id: number;
        name: string;
        level: number;
    }>;
    electiveDiplomas: Array<{
        id: number;
        name: string;
    }>;
    pathsCount: number;
    guideDiplomasCount: number;
    electiveDiplomasCount: number;
    nextPeak?: {
        id: number;
        name: string;
        type: string;
        order: number;
    };
}
