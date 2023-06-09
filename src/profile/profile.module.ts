import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from '@app/profile/profile.controller';
import { ProfileService } from '@app/profile/profile.service';
import { UserEntity } from '@app/user/user.entity';
import { UserGuardAuth } from '@app/user/guards/user.guard.auth';
import { FollowEntity } from '@app/profile/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity])],
  controllers: [ProfileController],
  providers: [ProfileService, UserGuardAuth],
  exports: [ProfileService],
})
export class ProfileModule {}
