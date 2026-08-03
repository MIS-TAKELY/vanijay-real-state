import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@repo/db';
import { SellerService } from './seller.service';

describe('SellerService', () => {
  let service: SellerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerService,
        {
          provide: PrismaClient,
          useValue: { user: { findUnique: jest.fn() }, $transaction: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SellerService>(SellerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
