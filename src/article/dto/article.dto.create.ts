import { IsNotEmpty, IsOptional } from 'class-validator';

export class ArticleDtoCreate {
  @IsNotEmpty()
  readonly title: string;

  @IsOptional()
  readonly description: string;

  @IsNotEmpty()
  readonly body: string;

  @IsOptional()
  tagList: string[];
}

export type ArticleDtoUpdate = Omit<ArticleDtoCreate, 'tagList'>;
