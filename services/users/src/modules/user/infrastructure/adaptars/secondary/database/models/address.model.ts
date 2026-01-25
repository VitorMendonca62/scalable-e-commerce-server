import { BrazilStates } from '@modules/user/domain/enums/brazil-ufs.enum';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('addresses')
export default class AddressModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userID: string;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column({ nullable: true })
  complement: string | undefined | null;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column({ name: 'postal_code', length: 8 })
  postalCode: string;

  @Column({ length: 2 })
  state: BrazilStates;

  @Column()
  country: string;
}
