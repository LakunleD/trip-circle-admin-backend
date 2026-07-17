import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

function getAllowedRedirectUrls(): string[] {
  return (process.env.ALLOWED_REDIRECT_URLS ?? process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const redirectUri = request.query?.redirect_uri as string | undefined;

    if (redirectUri && getAllowedRedirectUrls().includes(redirectUri)) {
      return { state: redirectUri };
    }

    return {};
  }
}

export { getAllowedRedirectUrls };
