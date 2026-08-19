import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { SaveSellerProfileDto } from './dto/save-seller-profile.dto';
import { SellerService } from './seller.service';

@Controller('api/v1/seller')
export class SellerController {
  constructor(private readonly sellers: SellerService) {}

  @Get('check-phone')
  @UseGuards(AuthGuard)
  checkPhone(@Query('phoneNumber') phoneNumber: string) {
    return this.sellers.isPhoneRegistered(phoneNumber);
  }

  @Post('register')
  @UseGuards(AuthGuard) // same guard your properties module uses
  register(@Body() dto: RegisterSellerDto, @CurrentUser('id') userId: string) {
    return this.sellers.completeSellerRegistration(userId, dto);
  }

  /** Current seller registration state (wizard resume + gates). */
  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@CurrentUser('id') userId: string) {
    return this.sellers.getSellerProfile(userId);
  }

  /** Persist wizard draft (save and resume). */
  @Patch('profile')
  @UseGuards(AuthGuard)
  saveProfile(
    @Body() dto: SaveSellerProfileDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.sellers.saveSellerProfile(userId, dto);
  }

  /** Final submission — validates completeness, then submits/approves. */
  @Post('submit')
  @UseGuards(AuthGuard)
  submit(@CurrentUser('id') userId: string) {
    return this.sellers.submitSellerProfile(userId);
  }
}
