import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpsertCitizenshipDocDto } from './dto/upsert-citizenship-doc.dto';
import { ProfileService } from './profile.service';

@Controller('api/v1/profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  getProfile(@CurrentUser('id') userId: string) {
    return this.profile.getProfile(userId);
  }

  @Patch()
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profile.updateProfile(userId, dto);
  }

  @Post('citizenship')
  upsertCitizenshipDoc(
    @CurrentUser('id') userId: string,
    @Body() dto: UpsertCitizenshipDocDto,
  ) {
    return this.profile.upsertCitizenshipDoc(userId, dto);
  }
}