import { validateENV } from "@config/environment/env.validate";
import { getCurrentNodeENV } from "@config/environment/utils";
import { UserModule } from "@modules/user2/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [getCurrentNodeENV()],
      validate: validateENV,
    }),

    UserModule,
  ],
  controllers: [],
})
export class AppModule {}
