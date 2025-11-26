import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
    IsNotEmpty,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO per un marker sulla mappa Eberron
 */
export class EberronMarkerDto {
    @IsNumber()
    lat!: number;

    @IsNumber()
    lng!: number;

    @IsString()
    text!: string;

    @IsString()
    type!: string; // 'city' | 'monster' | 'dungeon' | 'village' | 'other'

    @IsOptional()
    @IsInt()
    owner?: number; // userId del proprietario (per futura implementazione ruoli)
}

/**
 * DTO per un elemento disegnato sulla mappa Eberron
 */
export class EberronDrawnItemDto {
    @IsString()
    type!: string; // 'marker' | 'circle' | 'rectangle' | 'polygon' | 'polyline' | 'circlemarker'

    @IsOptional()
    @IsObject()
    latlng?: { lat: number; lng: number };

    @IsOptional()
    latlngs?: any; // Array di coordinate, struttura varia per tipo

    @IsOptional()
    @IsNumber()
    radius?: number;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsString()
    fillColor?: string;

    @IsOptional()
    @IsNumber()
    fillOpacity?: number;

    @IsOptional()
    @IsInt()
    owner?: number; // userId del proprietario (per futura implementazione ruoli)
}

/**
 * DTO per lo stato di un layer (raggruppamento per colore)
 */
export class LayerStateDto {
    @IsString()
    @IsNotEmpty()
    color!: string;

    @IsBoolean()
    visible!: boolean;

    @IsInt()
    @Min(0)
    itemCount!: number;
}

/**
 * DTO per i dati completi della mappa Eberron
 */
export class EberronMapDataDto {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EberronMarkerDto)
    markers?: EberronMarkerDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EberronDrawnItemDto)
    drawnItems?: EberronDrawnItemDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LayerStateDto)
    layers?: LayerStateDto[];
}
