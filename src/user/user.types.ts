import { UserEntity } from '@app/user/user.entity';

type User = Omit<UserEntity, 'hashPassword'>;
export type UserCommon = Pick<
  User,
  'id' | 'username' | 'email' | 'bio' | 'image'
>;

export interface IUserCommonResponse {
  user: UserCommon & { token: string };
}

export interface IUserListResponse {
  itemList: UserCommon[];
  total: number;
}
