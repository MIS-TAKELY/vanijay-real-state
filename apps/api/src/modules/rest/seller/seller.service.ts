import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  Prisma,
  PrismaClient,
  SellerAccountType,
  SellerRegistrationStatus,
  SellerSubType,
  UserRole,
} from '@repo/db';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { SaveSellerProfileDto } from './dto/save-seller-profile.dto';

/**
 * Versioned ownership declaration shown to Individual sellers. Stored on the
 * profile at agreement time so we always know which wording was accepted.
 */
export const OWNERSHIP_DECLARATION_TEXT =
  'I declare that I am the lawful owner of the property I am listing, or I ' +
  'have written authorization from the owner to list it on their behalf. I ' +
  'understand that providing false ownership information may result in my ' +
  'account being suspended and my listings removed.';

/** Sub types allowed for each account type. */
const SUB_TYPES_BY_ACCOUNT: Record<SellerAccountType, SellerSubType[]> = {
  [SellerAccountType.INDIVIDUAL]: [
    SellerSubType.OWNER,
    SellerSubType.SELLER,
    SellerSubType.LANDLORD,
  ],
  [SellerAccountType.AGENT]: [
    SellerSubType.BROKER,
    SellerSubType.REAL_ESTATE_AGENCY,
  ],
  [SellerAccountType.ORGANIZATION]: [
    SellerSubType.DEVELOPER,
    SellerSubType.REAL_ESTATE_COMPANY,
    SellerSubType.INSTITUTE,
    SellerSubType.CORPORATE_OWNER,
  ],
};

/**
 * Until an admin review queue exists, submissions are auto-approved so the
 * flow is usable end-to-end. Set SELLER_AUTO_APPROVE=false to keep
 * submissions in SUBMITTED pending manual review.
 */
function isAutoApproveEnabled(): boolean {
  return process.env.SELLER_AUTO_APPROVE !== 'false';
}

/** Fields the wizard may persist on a draft save (per account type). */
const DRAFT_FIELDS = [
  'fullName',
  'ownershipDeclared',
  'businessName',
  'representativeName',
  'hasBusinessRegistration',
  'registrationNumber',
  'businessEmail',
  'businessPhone',
  'website',
  'officeDistrict',
  'officeAddress',
  'officeLocation',
] as const;

type DraftField = (typeof DRAFT_FIELDS)[number];

/** Minimal shape needed for per-type completion validation. */
interface CompletenessInput {
  accountType: SellerAccountType;
  fullName: string | null;
  ownershipDeclared: boolean;
  businessName: string | null;
  representativeName: string | null;
  hasBusinessRegistration: boolean;
  registrationNumber: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  officeDistrict: string | null;
  officeAddress: string | null;
}

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

  /** Current seller registration state for the wizard / gates. */
  async getSellerProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true },
    });
    if (!user) throw new ForbiddenException('User not found');

    const profile = user.sellerProfile;

    return {
      exists: Boolean(profile),
      status: profile?.status ?? null,
      accountType: profile?.accountType ?? null,
      subType: profile?.subType ?? null,

      // Individual
      fullName: profile?.fullName ?? '',
      ownershipDeclared: profile?.ownershipDeclared ?? false,

      // Agent / Organization
      businessName: profile?.businessName ?? '',
      representativeName: profile?.representativeName ?? '',
      hasBusinessRegistration: profile?.hasBusinessRegistration ?? false,
      registrationNumber: profile?.registrationNumber ?? '',
      businessEmail: profile?.businessEmail ?? '',
      businessPhone: profile?.businessPhone ?? '',
      website: profile?.website ?? '',
      officeDistrict: profile?.officeDistrict ?? '',
      officeAddress: profile?.officeAddress ?? '',
      officeLocation: profile?.officeLocation ?? null,

      // Lifecycle
      submittedAt: profile?.submittedAt?.toISOString() ?? null,
      rejectionReason: profile?.rejectionReason ?? null,

      // Prerequisites surfaced to the client so the wizard can gate steps.
      requirements: {
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneNumberVerified,
      },
    };
  }

  /** Persist wizard progress. Only editable while DRAFT or REJECTED. */
  async saveSellerProfile(userId: string, dto: SaveSellerProfileDto) {
    this.assertSubTypeMatchesAccount(dto.accountType, dto.subType);

    const existing = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (
      existing &&
      existing.status !== SellerRegistrationStatus.DRAFT &&
      existing.status !== SellerRegistrationStatus.REJECTED
    ) {
      throw new ConflictException(
        'Your seller registration has already been submitted and can no longer be edited.',
      );
    }

    const data: Record<string, unknown> = {
      accountType: dto.accountType,
      subType: dto.subType,
    };
    for (const field of DRAFT_FIELDS) {
      const value = dto[field as DraftField];
      if (value !== undefined) data[field] = value;
    }

    // Record the declaration wording at the moment of agreement.
    if (dto.ownershipDeclared) {
      data.ownershipDeclarationText = OWNERSHIP_DECLARATION_TEXT;
      data.ownershipDeclaredAt = new Date();
    }

    // A rejected registration re-enters draft when the user edits it again.
    if (existing?.status === SellerRegistrationStatus.REJECTED) {
      data.status = SellerRegistrationStatus.DRAFT;
      data.rejectionReason = null;
    }

    await this.prisma.sellerProfile.upsert({
      where: { userId },
      create: {
        userId,
        accountType: dto.accountType,
        subType: dto.subType,
        ...data,
      } as Prisma.SellerProfileUncheckedCreateInput,
      update: data,
    });

    return this.getSellerProfile(userId);
  }

  /** Validate completeness per account type, then submit (and maybe approve). */
  async submitSellerProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true },
    });
    if (!user) throw new ForbiddenException('User not found');

    const profile = user.sellerProfile;
    if (!profile) {
      throw new BadRequestException(
        'Start your seller registration before submitting.',
      );
    }
    if (
      profile.status !== SellerRegistrationStatus.DRAFT &&
      profile.status !== SellerRegistrationStatus.REJECTED
    ) {
      throw new ConflictException('This registration has already been submitted.');
    }

    // Prerequisites: verified contact channels.
    if (!user.emailVerified) {
      throw new BadRequestException('Verify your email before submitting.');
    }
    if (!user.phoneNumberVerified) {
      throw new BadRequestException(
        'Verify your phone number before submitting.',
      );
    }

    this.validateCompleteness(profile);

    const autoApprove = isAutoApproveEnabled();
    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.sellerProfile.update({
        where: { userId },
        data: {
          status: autoApprove
            ? SellerRegistrationStatus.APPROVED
            : SellerRegistrationStatus.SUBMITTED,
          submittedAt: now,
          rejectionReason: null,
          ...(autoApprove ? { reviewedAt: now } : {}),
        },
      });

      if (autoApprove && !user.role.includes(UserRole.SELLER)) {
        await tx.user.update({
          where: { id: userId },
          data: { role: [...user.role, UserRole.SELLER] },
        });
      }

      return next;
    });

    const view = await this.getSellerProfile(userId);
    return {
      ...view,
      approved: updated.status === SellerRegistrationStatus.APPROVED,
    };
  }

  private assertSubTypeMatchesAccount(
    accountType: SellerAccountType,
    subType: SellerSubType,
  ): void {
    if (!SUB_TYPES_BY_ACCOUNT[accountType].includes(subType)) {
      throw new BadRequestException(
        `Sub type ${subType} is not valid for account type ${accountType}.`,
      );
    }
  }

  /** Per-type completion rules enforced at submission time. */
  private validateCompleteness(profile: CompletenessInput): void {
    const missing: string[] = [];

    if (profile.accountType === SellerAccountType.INDIVIDUAL) {
      if (!profile.fullName?.trim()) missing.push('Full name');
      if (!profile.ownershipDeclared) missing.push('Ownership declaration');
    } else {
      // AGENT and ORGANIZATION share the business fields.
      if (!profile.businessName?.trim()) missing.push('Business name');
      if (!profile.representativeName?.trim())
        missing.push('Representative name');
      if (profile.hasBusinessRegistration && !profile.registrationNumber?.trim())
        missing.push('Registration number');

      if (profile.accountType === SellerAccountType.ORGANIZATION) {
        if (!profile.businessEmail?.trim()) missing.push('Business email');
        if (!profile.businessPhone?.trim()) missing.push('Business phone');
        if (!profile.officeDistrict?.trim()) missing.push('Office district');
        if (!profile.officeAddress?.trim()) missing.push('Office address');
      }
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Complete the following before submitting: ${missing.join(', ')}.`,
      );
    }
  }
}
