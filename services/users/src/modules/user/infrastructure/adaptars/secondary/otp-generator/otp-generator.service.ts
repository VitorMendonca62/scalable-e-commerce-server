import { Injectable } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import { OtpGenerator } from '@user/domain/ports/secondary/otp-generator.port';

@Injectable()
export default class OtpGeneratorService implements OtpGenerator {
  generate(): string {
    return otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
  }
}
