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
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { FavoritesService } from './favorites.service';

@Controller('api/v1/favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.favorites.list(userId);
  }

  @Get('status/:propertyId')
  status(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favorites.status(userId, propertyId);
  }

  @Post()
  add(@CurrentUser('id') userId: string, @Body() dto: AddFavoriteDto) {
    return this.favorites.add(userId, dto);
  }

  @Patch(':propertyId')
  updateNotify(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: UpdateFavoriteDto,
  ) {
    return this.favorites.updateNotify(userId, propertyId, dto);
  }

  @Delete(':propertyId')
  remove(
    @CurrentUser('id') userId: string,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favorites.remove(userId, propertyId);
  }
}
