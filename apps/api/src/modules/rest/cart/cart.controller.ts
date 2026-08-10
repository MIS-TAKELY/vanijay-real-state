import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('api/v1/cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.cart.list(userId);
  }

  @Get('count')
  count(@CurrentUser('id') userId: string) {
    return this.cart.count(userId);
  }

  @Post()
  add(@CurrentUser('id') userId: string, @Body() dto: AddCartItemDto) {
    return this.cart.add(userId, dto);
  }

  @Patch(':propertyId')
  updateQuantity(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateQuantity(userId, propertyId, dto);
  }

  @Delete(':propertyId')
  remove(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.cart.remove(userId, propertyId);
  }
}
