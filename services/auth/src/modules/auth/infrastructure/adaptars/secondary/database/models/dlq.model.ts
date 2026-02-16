import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeadLetterMessageDocument = DeadLetterMessageModel & Document;

@Schema({
  timestamps: { createdAt: 'failedAt', updatedAt: 'lastRetryAt' },
  collection: 'dead_letter_queue',
})
export default class DeadLetterMessageModel extends Document {
  @Prop({ required: true, type: String })
  originalEvent: string;

  @Prop({ type: Object, required: true })
  originalPayload: Record<string, any>;

  @Prop({ type: String })
  errorMessage: string;

  failedAt: Date;
  lastRetryAt: Date;
}

export const DeadLetterMessageSchema = SchemaFactory.createForClass(
  DeadLetterMessageModel,
);
