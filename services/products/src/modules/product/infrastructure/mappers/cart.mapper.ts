import CartEntity from '@product/domain/entities/cart.entity';
import { CartItem } from '@product/domain/types/cart';
import { Injectable } from '@nestjs/common';
import { v7 } from 'uuid';
import CreateCartDTO from '@product/infrastructure/adaptars/primary/http/dtos/create-cart.dto';
import UpdateCartDTO from '@product/infrastructure/adaptars/primary/http/dtos/update-cart.dto';
import CartModel from '@product/infrastructure/adaptars/secondary/database/models/cart.model';

@Injectable()
export default class CartMapper {
  createDTOForEntity(dto: CreateCartDTO, userID: string): CartEntity {
    return new CartEntity({
      publicID: v7(),
      userID,
      items: dto.items,
    });
  }

  entityForModel(
    entity: CartEntity,
  ): Omit<CartModel, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      publicID: entity.publicID,
      userID: entity.userID,
      items: entity.items,
    };
  }

  updateDTOToEntityPartial(dto: UpdateCartDTO): Partial<{ items: CartItem[] }> {
    const partial: Partial<{ items: CartItem[] }> = {};

    if (dto.items !== undefined) {
      partial.items = dto.items;
    }

    return partial;
  }
}
