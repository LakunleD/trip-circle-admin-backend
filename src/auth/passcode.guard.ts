import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class PasscodeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const passcode = req.headers['x-admin-passcode'];

    if (!passcode || passcode !== process.env.ADMIN_PASSCODE) {
      throw new UnauthorizedException('Invalid or missing passcode');
    }

    return true;
  }
}