import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dead_letter_queue')
export default class DeadLetterMessageModel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  originalEvent: string;

  @Column({ type: 'jsonb', nullable: false })
  originalPayload: Record<string, any>;

  @Column({ type: 'varchar', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'failedAt' })
  failedAt: Date;

  @UpdateDateColumn({ name: 'lastRetryAt' })
  lastRetryAt: Date;
}
