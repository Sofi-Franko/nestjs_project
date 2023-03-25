import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import {
  ArticleDtoCreate,
  ArticleDtoUpdate,
} from '@app/article/dto/article.dto.create';
import { UserGuardAuth } from '@app/user/guards/user.guard.auth';
import { User } from '@app/user/decorators/user.decorator.get';
import {
  IArticleCommonResponse,
  IArticleDeleteResponse,
  IArticleFeed,
  IArticleListResponse,
} from '@app/article/article.types';
import { BackendValidationPipe } from '@app/shared/pipes/validation.pipe';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('list')
  async list(
    @Query() query: any, //todo type
    @User('id') userId: string,
  ): Promise<IArticleListResponse> {
    return this.articleService.list(userId, query);
  }

  @Get('feed')
  @UseGuards(UserGuardAuth)
  async feed(
    @Query() query: IArticleFeed,
    @User('id') userId: string,
  ): Promise<IArticleListResponse> {
    return this.articleService.feed(userId, query);
  }

  @Post('create')
  @UseGuards(UserGuardAuth)
  @UsePipes(new BackendValidationPipe())
  async create(
    @Body('article') dto: ArticleDtoCreate,
    @User('id') userId: string,
  ): Promise<IArticleCommonResponse> {
    const art = await this.articleService.create(userId, dto);

    return this.articleService.buildArticleResponse(art);
  }

  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<IArticleCommonResponse> {
    const art = await this.articleService.getBySlug(slug);

    return this.articleService.buildArticleResponse(art);
  }

  @Delete(':slug')
  @UseGuards(UserGuardAuth)
  async deleteBySlug(
    @Param('slug') slug: string,
    @User('id') userId: string,
  ): Promise<IArticleDeleteResponse> {
    await this.articleService.deleteBySlug(slug, userId);

    return { article: {} };
  }

  @Put(':slug')
  @UseGuards(UserGuardAuth)
  @UsePipes(new BackendValidationPipe())
  async update(
    @Param('slug') slug: string,
    @Body('article') dto: ArticleDtoUpdate,
    @User('id') userId: string,
  ): Promise<any> {
    const art = await this.articleService.updateBySlug(slug, dto, userId);

    return this.articleService.buildArticleResponse(art);
  }

  @Post(':slug/favorite')
  @UseGuards(UserGuardAuth)
  async addToFavorites(
    @User('id') userId: string,
    @Param('slug') slug: string,
  ): Promise<IArticleCommonResponse> {
    const art = await this.articleService.addToFavorites(slug, userId);

    return this.articleService.buildArticleResponse(art);
  }

  @Delete(':slug/unfavorite')
  @UseGuards(UserGuardAuth)
  async removeFromFavorites(
    @User('id') userId: string,
    @Param('slug') slug: string,
  ): Promise<IArticleCommonResponse> {
    const art = await this.articleService.removeFromFavorites(slug, userId);

    return this.articleService.buildArticleResponse(art);
  }
}
