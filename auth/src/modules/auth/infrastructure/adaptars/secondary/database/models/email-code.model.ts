import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EmailCodeDocument = EmailCodeModel & Document;

@Schema({ timestamps: true, collection: 'email-codes' })
export class EmailCodeModel {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  code: string;

  @Prop({ required: true, type: Date })
  codeExpiresIn: Date;

  @Prop({ required: true, type: Boolean, default: false })
  canUpdatePassword: Date;

  @Prop({ type: Date })
  canUpdatePasswordExpiresIn: Date | undefined;
}

export const EmailCodeSchema = SchemaFactory.createForClass(EmailCodeModel);
