import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UserDtoCreate {
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}

//TODO move
export class UserDtoLogin {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}

export class UserDtoUpdate {
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @IsOptional()
  readonly username: string;
  @IsOptional()
  readonly image: string;
  @IsOptional()
  readonly bio: string;
  @IsOptional()
  password: string;
}
