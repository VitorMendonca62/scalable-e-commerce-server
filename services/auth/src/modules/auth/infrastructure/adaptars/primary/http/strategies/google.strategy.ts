import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService<EnvironmentVariables>) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _: string,
    __: string,
    profile: UserGoogle,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, id, displayName, name } = profile;

    const user = {
      email: emails[0].value,
      username: displayName.replaceAll(' ', ''),
      name: `${name.givenName} ${name.familyName}`,
      id,
    };

    done(null, user);
  }
}
