import { Test, TestingModule } from '@nestjs/testing';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';

// better-auth is ESM-only; the controller imports AuthGuard which pulls in
// `@repo/auth` + `better-auth/node`. Mock them so this spec stays focused on
// the controller. Guards aren't executed on direct method calls.
jest.mock('@repo/auth', () => ({ auth: {} }));
jest.mock('better-auth/node', () => ({ fromNodeHeaders: jest.fn(() => ({})) }));

describe('SellerController', () => {
  let controller: SellerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerController],
      providers: [{ provide: SellerService, useValue: { completeSellerRegistration: jest.fn() } }],
    }).compile();

    controller = module.get<SellerController>(SellerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
