import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { LocationType } from '../entities/location.entity';

export class CreateLocationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(LocationType)
    @IsOptional()
    type?: LocationType;

    @IsNumber()
    @IsOptional()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsNumber()
    @IsOptional()
    @Min(-180)
    @Max(180)
    longitude?: number;
}
