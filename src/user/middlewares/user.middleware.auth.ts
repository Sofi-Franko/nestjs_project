import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { IExpressRequest } from '@app/types/express.extension.types';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: IExpressRequest, res: Response, next: NextFunction) {
    const authInfo = req.headers.authorization;
    if (!authInfo) {
      req.user = null;
      next();
      return;
    }

    const token = authInfo.split(' ')[1];
    try {
      const decode = verify(token, JWT_SECRET);
      req.user = await this.userService.findById(decode.id);
    } catch (e) {
      req.user = null;
    }

    next();
  }
}
