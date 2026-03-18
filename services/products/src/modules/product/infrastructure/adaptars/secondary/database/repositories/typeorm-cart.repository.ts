import CartRepository from '@product/domain/ports/secondary/cart-repository.port';
import CartModel from '../models/cart.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export default class TypeOrmCategoryRepositoryTypeOrmCartRepository implements CartRepository {
  constructor(
    @InjectRepository(CartModel)
    private cartRepository: Repository<CartModel>,
  ) {}

  async add(
    newCart: Omit<CartModel, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    await this.cartRepository.save(newCart);
  }

  async getOne(
    publicID: string,
    userID: string,
  ): Promise<Omit<CartModel, 'id' | 'userID'> | null> {
    return this.cartRepository.findOne({
      where: { publicID, userID },
      select: ['publicID', 'items', 'createdAt', 'updatedAt'],
    });
  }

  async findByUser(
    userID: string,
  ): Promise<Omit<CartModel, 'id' | 'userID'>[]> {
    return this.cartRepository.find({
      where: { userID },
      select: ['publicID', 'userID', 'items', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    cartID: string,
    userID: string,
    updates: Partial<CartModel>,
  ): Promise<boolean> {
    return (
      (await this.cartRepository.update({ publicID: cartID, userID }, updates))
        .affected >= 1
    );
  }

  async delete(cartID: string, userID: string): Promise<boolean> {
    return (
      (await this.cartRepository.delete({ publicID: cartID, userID }))
        .affected >= 1
    );
  }
}
