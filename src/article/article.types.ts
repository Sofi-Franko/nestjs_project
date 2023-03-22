import { ArticleEntity } from '@app/article/article.entity';

export type Article = Omit<ArticleEntity, 'updateTimestamp'>;

export interface IArticleCommonResponse {
  article: Article;
}

export interface IArticleDeleteResponse {
  article: Record<string, never>; // empty {}
}

export interface IArticleListResponse {
  articles: Article[];
  articlesCount: number;
}

export interface IArticleFeed {
  limit: number;
  offset: number;
}
