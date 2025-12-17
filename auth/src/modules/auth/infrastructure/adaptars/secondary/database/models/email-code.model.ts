import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EmailCodeDocument = EmailCodeModel & Document;

@Schema({ timestamps: true, collection: 'email-codes' })
export class EmailCodeModel {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  code: string;

  @Prop({ required: true, type: Date, expires: 0 })
  expiresIn: Date;
}

export const EmailCodeSchema = SchemaFactory.createForClass(EmailCodeModel);
