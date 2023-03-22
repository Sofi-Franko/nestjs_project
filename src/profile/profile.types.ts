import { UserCommon } from '@app/user/user.types';

// type CommonUserKeys = Pick<UserEntity, 'username' | 'bio' | 'image'>;

export type ProfileCommon = UserCommon & { following: boolean };

export interface IProfileCommonResponse {
  profile: ProfileCommon;
}
