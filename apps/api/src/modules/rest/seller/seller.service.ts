import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/db';
import { RegisterSellerDto } from './dto/register-seller.dto';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaClient) {}
  async completeSellerRegistration(userId: string, dto: RegisterSellerDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user?.phoneNumberVerified) {
      throw new ForbiddenException('Verify your phone number first');
    }

    return this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          role: ['SELLER'],
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
