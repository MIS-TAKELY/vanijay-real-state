import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/db';
import { RegisterSellerDto } from './dto/register-seller.dto';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaClient) {}
  async isPhoneRegistered(
    phoneNumber: string,
  ): Promise<{ registered: boolean }> {
    const count = await this.prisma.user.count({
      where: { phoneNumber },
    });
    return { registered: count > 0 };
  }

  async completeSellerRegistration(userId: string, dto: RegisterSellerDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.phoneNumberVerified) {
      throw new ForbiddenException('Verify your phone number first');
    }

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          role: ['BUYER', 'SELLER'],
          agreedToTerms: dto.agreedToTerms,
        },
      }),
      this.prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          permanentAddress: dto.permanentAddress,
        },
        update: {
          permanentAddress: dto.permanentAddress,
        },
      }),
    ]);
  }
}
