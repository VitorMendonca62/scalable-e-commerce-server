import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EmailCodeDocument = EmailCode & Document;

@Schema({ timestamps: true, collection: 'email-codes' })
export class EmailCode {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  code: string;

  @Prop({ required: true, type: Date })
  expiresIn: Date;
}

export const EmailCodeSchema = SchemaFactory.createForClass(EmailCode);
