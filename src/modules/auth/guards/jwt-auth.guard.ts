import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, throw UnauthorizedException
    if (err || !user) {
      throw new UnauthorizedException(info?.message);
    }
    return user;
  }
}
