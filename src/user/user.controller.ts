import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { IUserListResponse, IUserCommonResponse } from '@app/user/user.types';
import { UserService } from '@app/user/user.service';
import {
  UserDtoCreate,
  UserDtoLogin,
  UserDtoUpdate,
} from '@app/user/dto/user.dto.create';
import { User } from '@app/user/decorators/user.decorator.get';
import { UserEntity } from '@app/user/user.entity';
import { UserGuardAuth } from '@app/user/guards/user.guard.auth';
import { BackendValidationPipe } from '@app/shared/pipes/validation.pipe';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UsePipes(new BackendValidationPipe())
  // BODY: { user: { ... } } - just to read 'user' key
  async create(
    @Body('user') userCreateDto: UserDtoCreate,
  ): Promise<IUserCommonResponse> {
    const user = await this.userService.create(userCreateDto);

    return this.userService.buildUserResponse(user);
  }

  @Post('login')
  @UsePipes(new BackendValidationPipe())
  async login(@Body('user') dto: UserDtoLogin): Promise<IUserCommonResponse> {
    const user = await this.userService.login(dto);

    return this.userService.buildUserResponse(user);
  }

  @Put('update')
  @UseGuards(UserGuardAuth)
  @UsePipes(new BackendValidationPipe())
  async update(
    @Body('user') dto: UserDtoUpdate,
    @User('id') userId: string,
  ): Promise<IUserCommonResponse> {
    const user = await this.userService.update(userId, dto);

    return this.userService.buildUserResponse(user);
  }

  @Get()
  @UseGuards(UserGuardAuth)
  async getCurrent(@User() user: UserEntity): Promise<IUserCommonResponse> {
    return this.userService.buildUserResponse(user);
  }

  @Get('list')
  async list(): Promise<IUserListResponse> {
    const list = await this.userService.list();

    return {
      itemList: list,
      total: list.length,
    };
  }
}
