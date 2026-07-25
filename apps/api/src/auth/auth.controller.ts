import { All, Controller, Req, Res } from '@nestjs/common';
import { auth } from '@repo/auth';
import type { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';

@Controller('api/auth')
export class AuthController {
  private readonly handler = toNodeHandler(auth);

  @All()
  async handle(@Req() req: Request, @Res() res: Response) {
    return this.handler(req, res);
  }
}
