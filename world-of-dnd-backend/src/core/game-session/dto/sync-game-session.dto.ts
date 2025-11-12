import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CharacterSkillDto {
  @IsInt()
  skillId!: number;

  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @IsOptional()
  @IsBoolean()
  checked2?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  ranks?: number;

  @IsOptional()
  @IsInt()
  miscMod?: number;

  @IsOptional()
  @IsInt()
  total?: number;
}

export class CharacterSpellDto {
  @IsInt()
  spellId!: number;

  @IsOptional()
  @IsBoolean()
  isPrepared?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  timesUsed?: number;
}

export class CharacterTalentDto {
  @IsInt()
  talentId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  acquiredAt?: number;
}

export class CharacterDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  race?: string;

  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsInt()
  experience?: number;

  // Attributes
  @IsOptional()
  @IsInt()
  strength?: number;

  @IsOptional()
  @IsInt()
  dexterity?: number;

  @IsOptional()
  @IsInt()
  constitution?: number;

  @IsOptional()
  @IsInt()
  intelligence?: number;

  @IsOptional()
  @IsInt()
  wisdom?: number;

  @IsOptional()
  @IsInt()
  charisma?: number;

  // Combat
  @IsOptional()
  @IsInt()
  hitPoints?: number;

  @IsOptional()
  @IsInt()
  maxHitPoints?: number;

  @IsOptional()
  @IsInt()
  armorClass?: number;

  @IsOptional()
  @IsInt()
  initiative?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterSkillDto)
  skills?: CharacterSkillDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterSpellDto)
  spells?: CharacterSpellDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterTalentDto)
  talents?: CharacterTalentDto[];
}

export class SyncGameSessionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterDto)
  characters?: CharacterDto[];

  @IsOptional()
  @IsObject()
  // Fallback for any additional dynamic data
  data?: any;
}
