import { UserEntity } from '@app/user/user.entity';
import { JWT_SECRET } from '@app/config';
import { sign } from 'jsonwebtoken';

class UtilsJwt {
  generateUserJWT(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }
}

export default new UtilsJwt();
