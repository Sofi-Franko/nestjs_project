import { UserCommon } from '@app/user/user.types';

export type ProfileCommon = UserCommon & { following: boolean };

export interface IProfileCommonResponse {
  profile: ProfileCommon;
}
