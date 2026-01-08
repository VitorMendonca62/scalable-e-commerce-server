import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    controller = new AppController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCerts', () => {
    it('should return pong', async () => {
      const result = controller.ping();
      expect(result).toBe('pong');
    });
  });
});
