import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@repo/db';
import { SellerService } from './seller.service';

describe('SellerService', () => {
  let service: SellerService;

  const user = {
    id: 'user-1',
    emailVerified: true,
    phoneNumberVerified: true,
    role: ['BUYER'],
    sellerProfile: null as unknown,
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    sellerProfile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    userProfile: { upsert: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerService,
        { provide: PrismaClient, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SellerService>(SellerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSellerProfile', () => {
    it('returns empty state when no profile exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        sellerProfile: null,
      });

      const result = await service.getSellerProfile('user-1');

      expect(result.exists).toBe(false);
      expect(result.status).toBeNull();
      expect(result.requirements).toEqual({
        emailVerified: true,
        phoneVerified: true,
      });
    });
  });

  describe('saveSellerProfile', () => {
    it('rejects a sub type that does not match the account type', async () => {
      await expect(
        service.saveSellerProfile('user-1', {
          accountType: 'INDIVIDUAL' as never,
          subType: 'BROKER' as never,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects edits once submitted', async () => {
      prismaMock.sellerProfile.findUnique.mockResolvedValue({
        status: 'SUBMITTED',
      });

      await expect(
        service.saveSellerProfile('user-1', {
          accountType: 'INDIVIDUAL' as never,
          subType: 'OWNER' as never,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('upserts the draft and returns the refreshed view', async () => {
      prismaMock.sellerProfile.findUnique.mockResolvedValue(null);
      prismaMock.sellerProfile.upsert.mockResolvedValue({});
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        sellerProfile: {
          status: 'DRAFT',
          accountType: 'INDIVIDUAL',
          subType: 'OWNER',
          fullName: 'Asha',
          ownershipDeclared: false,
        },
      });

      const result = await service.saveSellerProfile('user-1', {
        accountType: 'INDIVIDUAL' as never,
        subType: 'OWNER' as never,
        fullName: 'Asha',
      });

      expect(prismaMock.sellerProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          create: expect.objectContaining({ fullName: 'Asha' }),
        }),
      );
      expect(result.fullName).toBe('Asha');
    });
  });

  describe('submitSellerProfile', () => {
    it('requires a profile to exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        sellerProfile: null,
      });

      await expect(service.submitSellerProfile('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('requires email and phone verification', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        emailVerified: false,
        sellerProfile: { status: 'DRAFT', accountType: 'INDIVIDUAL' },
      });

      await expect(service.submitSellerProfile('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('enforces individual completeness', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        sellerProfile: {
          status: 'DRAFT',
          accountType: 'INDIVIDUAL',
          fullName: '',
          ownershipDeclared: false,
        },
      });

      await expect(service.submitSellerProfile('user-1')).rejects.toThrow(
        /Full name/,
      );
    });

    it('auto-approves and grants the SELLER role when enabled', async () => {
      const profile = {
        status: 'DRAFT',
        accountType: 'INDIVIDUAL',
        fullName: 'Asha',
        ownershipDeclared: true,
      };
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        sellerProfile: profile,
      });

      const tx = {
        sellerProfile: {
          update: jest.fn().mockResolvedValue({ status: 'APPROVED' }),
        },
        user: { update: jest.fn().mockResolvedValue({}) },
      };
      prismaMock.$transaction.mockImplementation(async (fn: unknown) =>
        (fn as (tx: unknown) => Promise<unknown>)(tx),
      );
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ ...user, sellerProfile: profile })
        .mockResolvedValueOnce({
          ...user,
          role: ['BUYER', 'SELLER'],
          sellerProfile: { ...profile, status: 'APPROVED' },
        });

      const result = await service.submitSellerProfile('user-1');

      expect(result.approved).toBe(true);
      expect(tx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { role: ['BUYER', 'SELLER'] },
        }),
      );
    });

    it('rejects double submission', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        sellerProfile: { status: 'SUBMITTED', accountType: 'INDIVIDUAL' },
      });

      await expect(service.submitSellerProfile('user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('completeSellerRegistration (legacy)', () => {
    it('requires a verified phone number', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...user,
        phoneNumberVerified: false,
      });

      await expect(
        service.completeSellerRegistration('user-1', { agreedToTerms: true }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
