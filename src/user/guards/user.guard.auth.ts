import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { IExpressRequest } from '@app/types/express.extension.types';

@Injectable()
export class UserGuardAuth implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<IExpressRequest>();

    if (!req.user) {
      throw new HttpException(
        'User is not authorized to execute this route',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
