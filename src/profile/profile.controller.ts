import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@app/user/decorators/user.decorator.get';
import { IProfileCommonResponse } from '@app/profile/profile.types';
import { ProfileService } from '@app/profile/profile.service';
import { UserGuardAuth } from '@app/user/guards/user.guard.auth';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async get(
    @Param('username') profileUsername: string,
    @User('id') currentUserId: string,
  ): Promise<IProfileCommonResponse> {
    const profile = await this.profileService.get(
      profileUsername,
      currentUserId,
    );

    return this.profileService.buildUserResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(UserGuardAuth)
  async follow(
    @Param('username') profileUsername: string,
    @User('id') currentUserId: string,
  ): Promise<IProfileCommonResponse> {
    const profile = await this.profileService.follow(
      profileUsername,
      currentUserId,
    );

    return this.profileService.buildUserResponse(profile);
  }

  @Delete(':username/unfollow')
  @UseGuards(UserGuardAuth)
  async unfollow(
    @Param('username') profileUsername: string,
    @User('id') currentUserId: string,
  ): Promise<IProfileCommonResponse> {
    const profile = await this.profileService.unfollow(
      profileUsername,
      currentUserId,
    );

    return this.profileService.buildUserResponse(profile);
  }
}
