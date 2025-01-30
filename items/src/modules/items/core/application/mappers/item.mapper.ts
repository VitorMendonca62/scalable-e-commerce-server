import { CreateItemDTO } from '@modules/items/adaptars/primary/http/dtos/create-item.dto';

export class ItemMapper {
  createItemDTOForEntity(dto: CreateItemDTO): Item {}
}
