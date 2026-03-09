import {
  EnvironmentVariables,
  NodeEnv,
} from '@config/environment/env.validation';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';

export const configNodeMailer = (
  configService: ConfigService<EnvironmentVariables>,
) => {
  return {
    transport: {
      host: configService.get('SMTP_HOST'),
      port: configService.get('SMTP_PORT'),
      secure: configService.get('NODE_ENV') === NodeEnv.Production,
      auth: {
        user: configService.get('SMPT_USER_ID'),
        pass: configService.get('SMPT_USER_PASSWORD'),
      },
    },

    template: {
      dir: __dirname + '/../../../templates',
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  } as MailerOptions;
};
