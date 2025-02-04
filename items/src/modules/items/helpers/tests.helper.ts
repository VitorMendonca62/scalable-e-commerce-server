import { CreateItemDTO } from '../adaptars/primary/http/dtos/create-item.dto';
import { Item } from '../core/domain/entities/item.entity';
import { faker } from '@faker-js/faker';

interface MockItem extends CreateItemDTO {
  _id?: string;
  rating: number;
}

export const mockItem = (overrides: Partial<MockItem> = {}) => {
  const item = new Item(mockCreateItemDTO(overrides));

  if (overrides._id) {
    item._id = overrides._id;
  }

  if (overrides.rating) {
    item.rating = overrides.rating;
  } else {
    item.rating = faker.number.float({ min: 0, max: 5, fractionDigits: 2 });
  }

  item.raters = faker.number.int({ min: 0, max: 500 });

  return item;
};

export const mockCreateItemDTO = (
  overrides: Partial<CreateItemDTO> = {},
): CreateItemDTO => {
  const attributes = {
    color: faker.color.human(),
    model: faker.string.alphanumeric(8).toUpperCase(),
  };
  const technicalDetails = {
    weight: faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }) + ' kg',
    dimensions: `${faker.number.int({ min: 10, max: 50 })} x ${faker.number.int({ min: 10, max: 50 })} x ${faker.number.int({ min: 1, max: 10 })} cm`,
    material: faker.commerce.productMaterial(),
    warranty: faker.helpers.arrayElement(['6 meses', '1 ano', '2 anos']),
    manufacturer: faker.company.name(),
  };

  return {
    amount: faker.number.int(),
    attributes,
    technicalDetails,
    available: true,
    category: faker.commerce.department(),
    description: faker.commerce.productDescription(),
    photos: [faker.image.dataUri(), faker.image.dataUri()],
    price: faker.number.float({ min: 0.5, max: 100, fractionDigits: 2 }),
    title: faker.commerce.product(),
    ...overrides,
  };
};

export const mockItemsList = () => {
  return [
    mockItem({
      title: 'item 01',
      _id: '1',
      category: 'garden',
      price: 23,
      rating: 4,
    }),
    mockItem({ title: 'item 02', _id: '2' }),
    mockItem({ title: 'item 03', _id: '3' }),
  ];
};
