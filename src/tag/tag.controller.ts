import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';

type ITags = { tags: string[] };

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<ITags> {
    const tags = await this.tagService.findAll();
    return {
      tags: tags.map((t) => t.name),
    };
  }
}
