import { hash, compare } from 'bcrypt';

const DEFAULT_SALT = 10;

class UtilsPassword {
  async hash(pass: string): Promise<string> {
    return hash(pass, DEFAULT_SALT);
  }

  async isPasswordMatch(dtoPass: string, storedPass: string): Promise<boolean> {
    return compare(dtoPass, storedPass);
  }
}

export default new UtilsPassword();
