import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RegisterSellerDto } from './dto/register-seller.dto';
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
}
