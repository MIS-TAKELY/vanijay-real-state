import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@repo/db';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpsertCitizenshipDocDto } from './dto/upsert-citizenship-doc.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaClient) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        documents: {
          where: {
            type: { in: ['CITIZENSHIP_FRONT', 'CITIZENSHIP_BACK'] },
          },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const frontDoc = user.documents.find((d) => d.type === 'CITIZENSHIP_FRONT');
    const backDoc = user.documents.find((d) => d.type === 'CITIZENSHIP_BACK');

    const verificationLevel = this.computeVerificationLevel(
      user.emailVerified,
      user.phoneNumberVerified,
      frontDoc?.status,
      backDoc?.status,
      user.isVerified,
    );

    const citizenshipStatus = this.computeCitizenshipStatus(
      frontDoc?.status,
      backDoc?.status,
    );

    const maskedCitizenshipNo = user.profile?.citizenshipNo
      ? `••••••••${user.profile.citizenshipNo.slice(-2)}`
      : '';

    return {
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phoneNumber ?? '',
      phoneVerified: user.phoneNumberVerified,
      avatarUrl: user.profile?.avatarUrl ?? user.image ?? null,
      roles: user.role,
      verificationLevel,
      permanentDistrict: user.profile?.permanentDistrict ?? '',
      permanentAddress: user.profile?.permanentAddress ?? '',
      preferredLanguage: user.profile?.preferredLanguage ?? 'en',
      preferredContactMethod: user.profile?.preferredContactMethod ?? 'PHONE',
      citizenshipNo: maskedCitizenshipNo,
      citizenshipIssueDate: user.profile?.citizenshipIssueDate
        ? user.profile.citizenshipIssueDate.toISOString().slice(0, 10)
        : '',
      citizenshipStatus,
      licenseNumber: user.profile?.licenseNumber ?? null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      if (dto.name !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { name: dto.name },
        });
      }

      const profileFields: Record<string, unknown> = {};
      if (dto.permanentDistrict !== undefined)
        profileFields.permanentDistrict = dto.permanentDistrict;
      if (dto.permanentAddress !== undefined)
        profileFields.permanentAddress = dto.permanentAddress;
      if (dto.preferredLanguage !== undefined)
        profileFields.preferredLanguage = dto.preferredLanguage;
      if (dto.preferredContactMethod !== undefined)
        profileFields.preferredContactMethod = dto.preferredContactMethod;
      if (dto.bio !== undefined) profileFields.bio = dto.bio;
      if (dto.licenseNumber !== undefined)
        profileFields.licenseNumber = dto.licenseNumber;

      if (Object.keys(profileFields).length > 0) {
        await tx.userProfile.upsert({
          where: { userId },
          create: { userId, ...profileFields },
          update: profileFields,
        });
      }
    });

    return this.getProfile(userId);
  }

  async upsertCitizenshipDoc(userId: string, dto: UpsertCitizenshipDocDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      // Only upsert document record when a file URL is provided
      if (dto.fileUrl) {
        const existing = await tx.userDocument.findFirst({
          where: { userId, type: dto.type },
          orderBy: { uploadedAt: 'desc' },
        });

        await tx.userDocument.upsert({
          where: { id: existing?.id ?? '__nonexistent__' },
          create: {
            userId,
            type: dto.type,
            fileUrl: dto.fileUrl,
            fileName:
              dto.type === 'CITIZENSHIP_FRONT'
                ? 'citizenship_front'
                : 'citizenship_back',
            fileSizeMb: 0,
            status: 'PENDING',
          },
          update: {
            fileUrl: dto.fileUrl,
            status: 'PENDING',
          },
        });
      }

      // Persist citizenship metadata on the profile when provided
      const profileFields: Record<string, unknown> = {};
      if (dto.citizenshipNo !== undefined)
        profileFields.citizenshipNo = dto.citizenshipNo;
      if (dto.citizenshipIssueDate !== undefined)
        profileFields.citizenshipIssueDate = new Date(dto.citizenshipIssueDate);

      if (Object.keys(profileFields).length > 0) {
        await tx.userProfile.upsert({
          where: { userId },
          create: { userId, ...profileFields },
          update: profileFields,
        });
      }
    });

    return this.getProfile(userId);
  }

  private computeVerificationLevel(
    emailVerified: boolean,
    phoneVerified: boolean,
    frontStatus?: string,
    backStatus?: string,
    isFieldVerified?: boolean,
  ): 0 | 1 | 2 | 3 {
    if (!emailVerified || !phoneVerified) return 0;
    if (frontStatus === 'VERIFIED' && backStatus === 'VERIFIED') {
      if (isFieldVerified) return 3;
      return 2;
    }
    return 1;
  }

  private computeCitizenshipStatus(
    frontStatus?: string,
    backStatus?: string,
  ): 'verified' | 'pending' | 'none' {
    if (!frontStatus && !backStatus) return 'none';
    if (frontStatus === 'VERIFIED' && backStatus === 'VERIFIED')
      return 'verified';
    return 'pending';
  }
}
