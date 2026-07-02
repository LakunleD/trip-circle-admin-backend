import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ServiceTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-service-token'];

    if (!token || token !== process.env.SERVICE_TOKEN) {
      throw new UnauthorizedException('Invalid service token');
    }

    return true;
  }
}
