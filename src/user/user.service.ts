import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserCommonResponse } from '@app/user/user.types';
import {
  UserDtoCreate,
  UserDtoLogin,
  UserDtoUpdate,
} from '@app/user/dto/user.dto.create';
import { UserEntity } from '@app/user/user.entity';
import { Repository } from 'typeorm';
import JwtUtils from '@app/shared/utils/jwt.util';
import UtilsPassword from '@app/shared/utils/password.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(dto: UserDtoCreate): Promise<UserEntity> {
    let user = await this.userRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (user) {
      throw new HttpException(
        'User with such email or username already exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    user = new UserEntity();
    Object.assign(user, dto);

    return this.userRepository.save(user);
  }

  async login(dto: UserDtoLogin): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'username', 'email', 'bio', 'image', 'password'],
    });

    if (!user) {
      throw new HttpException(
        'User with provided email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordCorrect = await UtilsPassword.isPasswordMatch(
      dto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }

    delete user.password;

    return user;
  }

  async update(id: string, dto: UserDtoUpdate): Promise<UserEntity> {
    if (dto.password) {
      dto.password = await UtilsPassword.hash(dto.password);
    }
    await this.userRepository.update({ id }, dto);

    return this.findById(id);
  }

  findById(id: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async list(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  buildUserResponse(user: UserEntity): IUserCommonResponse {
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
        token: JwtUtils.generateUserJWT(user),
      },
    };
  }
}
