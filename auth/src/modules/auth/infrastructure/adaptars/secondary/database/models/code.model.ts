import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CodeDocument = CodeModel & Document;

@Schema({ timestamps: true, collection: 'codes' })
export class CodeModel {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  code: string;

  @Prop({ required: true, type: Date })
  expiresIn: Date;
}

export const CodeSchema = SchemaFactory.createForClass(CodeModel);
