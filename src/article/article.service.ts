import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeleteResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import {
  ArticleDtoCreate,
  ArticleDtoUpdate,
} from '@app/article/dto/article.dto.create';
import { ArticleEntity } from '@app/article/article.entity';
import {
  Article,
  IArticleCommonResponse,
  IArticleFeed,
  IArticleListResponse,
} from '@app/article/article.types';
import slugify from 'slugify';
import { UserEntity } from '@app/user/user.entity';
import { FollowEntity } from '@app/profile/follow.entity';

// todo MOVE
const getRandomPostfix = () =>
  ((Math.random() * Math.pow(36, 6)) | 0).toString(36);

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    private dataSource: DataSource,
  ) {}

  async list(userId: string, query: any): Promise<IArticleListResponse> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    // AUTHOR
    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });

      if (!author)
        throw new HttpException('Author does not exist', HttpStatus.NOT_FOUND);

      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }
    // TAG
    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }
    // FAVORITED
    if (query.favorited) {
      const user: UserEntity = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });

      if (!user)
        throw new HttpException(
          'User does not exist, so that there cannot be any liked articles',
          HttpStatus.NOT_FOUND,
        );

      const ids: string[] = user.favorites.map((art) => art.id);
      if (ids.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0'); // to cut off query if no any liked posts by user
      }
    }
    // LIMIT & OFFSET
    if (query.limit) queryBuilder.limit(query.limit);
    if (query.offset) queryBuilder.offset(query.offset);
    // SORT
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articles = await this.getArticlesExtendedWithFavoriteField(
      userId,
      queryBuilder,
    );
    const articlesCount: number = await queryBuilder.getCount();

    return { articles, articlesCount };
  }

  async feed(
    userId: string,
    query: IArticleFeed,
  ): Promise<IArticleListResponse> {
    const followingsByUser = await this.followRepository.find({
      where: { followerId: userId },
    });
    if (!followingsByUser.length) return { articles: [], articlesCount: 0 };

    const ids: string[] = followingsByUser.map((u) => u.followingId);
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.author.id IN (:...ids)', { ids });

    // LIMIT & OFFSET
    if (query.limit) queryBuilder.limit(query.limit);
    if (query.offset) queryBuilder.offset(query.offset);
    // SORT
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articles = await this.getArticlesExtendedWithFavoriteField(
      userId,
      queryBuilder,
    );
    const articlesCount: number = await queryBuilder.getCount();

    return { articles, articlesCount };
  }

  async create(userId: string, dto: ArticleDtoCreate): Promise<ArticleEntity> {
    const article = new ArticleEntity();

    if (!dto.tagList) dto.tagList = [];
    const slug = this.buildSlug(dto.title);

    Object.assign(article, { ...dto, slug, author: userId });
    return this.articleRepository.save(article);
  }

  async getBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.get({ slug });

    if (!article) {
      throw new HttpException(
        'Article with provided slug does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    return article;
  }

  async deleteBySlug(slug: string, userId: string): Promise<DeleteResult> {
    const article = await this.getBySlug(slug);

    if (article.author.id != userId) {
      throw new HttpException(
        'Only author has permissions to delete an article',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.articleRepository.delete({ slug });
  }

  async updateBySlug(
    slug: string,
    dto: ArticleDtoUpdate,
    userId: string,
  ): Promise<ArticleEntity> {
    const article = await this.getBySlug(slug);

    if (article.author.id != userId) {
      throw new HttpException(
        'Only author has permissions to update an article',
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedSlug = this.buildSlug(dto.title);

    Object.assign(article, { ...dto, slug: updatedSlug });
    return this.articleRepository.save(article);
  }

  async addToFavorites(slug: string, userId: string): Promise<ArticleEntity> {
    const article = await this.getBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    const isNotFav = this.getFavoriteArticleIndex(user, article) === -1;
    if (isNotFav) {
      user.favorites.push(article);
      article.favoritesCount++;

      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async removeFromFavorites(
    slug: string,
    userId: string,
  ): Promise<ArticleEntity> {
    const article = await this.getBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    const favIndex = this.getFavoriteArticleIndex(user, article);
    if (favIndex !== -1) {
      user.favorites.splice(favIndex, 1);
      article.favoritesCount--;

      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): IArticleCommonResponse {
    return { article };
  }

  //todo rm any
  private get(criteria: any): Promise<ArticleEntity> {
    return this.articleRepository.findOne({ where: criteria });
  }

  private buildSlug(title: string): string {
    const slugFromTitle = slugify(title, { lower: true }); // Ab c D => ab-c-d
    return slugFromTitle + '-' + getRandomPostfix();
  }

  private getFavoriteArticleIndex(
    user: UserEntity,
    art: ArticleEntity,
  ): number {
    return user.favorites.findIndex((favArt) => favArt.id === art.id);
  }

  private async getArticlesExtendedWithFavoriteField(
    userId: string,
    queryBuilder: SelectQueryBuilder<ArticleEntity>,
  ): Promise<Article[]> {
    let favoriteArticleIds: string[] = [];
    if (userId) {
      const user: UserEntity = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favorites'],
      });

      favoriteArticleIds = user.favorites.map((fav) => fav.id);
    }

    const articles: ArticleEntity[] = await queryBuilder.getMany();
    return articles.map((art) => {
      const isFavorited = favoriteArticleIds.includes(art.id);
      return { ...art, favorited: isFavorited };
    });
  }
}
