import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import {
  IProfileCommonResponse,
  ProfileCommon,
} from '@app/profile/profile.types';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async get(profileUsername: string, currentUserId): Promise<ProfileCommon> {
    const user = await this.getUserAndValidateIfExists(profileUsername);

    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: user.id },
    });

    return {
      ...user,
      following: !!follow,
    };
  }

  async follow(profileUsername: string, currentUserId): Promise<ProfileCommon> {
    const user = await this.getUserAndValidateIfExists(profileUsername);
    this.validateIsMatchesCurrentUser(user.id, currentUserId);

    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: user.id },
    });

    if (!follow) {
      const followEntity = new FollowEntity();
      followEntity.followerId = currentUserId;
      followEntity.followingId = user.id;
      await this.followRepository.save(followEntity);
    }

    return {
      ...user,
      following: true,
    };
  }

  async unfollow(
    profileUsername: string,
    currentUserId,
  ): Promise<ProfileCommon> {
    const user = await this.getUserAndValidateIfExists(profileUsername);
    this.validateIsMatchesCurrentUser(user.id, currentUserId);

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });

    return {
      ...user,
      following: false,
    };
  }

  buildUserResponse(profile: ProfileCommon): IProfileCommonResponse {
    delete profile.email;
    return { profile };
  }

  private async getUserAndValidateIfExists(
    username: string,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user)
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);

    return user;
  }

  private validateIsMatchesCurrentUser(
    userId: string,
    currentUserId: string,
  ): void {
    if (userId === currentUserId)
      throw new HttpException(
        'Follower & following cannot be equal',
        HttpStatus.BAD_REQUEST,
      );
  }
}
