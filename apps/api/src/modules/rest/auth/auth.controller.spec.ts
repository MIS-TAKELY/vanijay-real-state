import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// better-auth ships ESM that jest cannot parse by default — mock it here since
// the spec only asserts the controller is instantiable.
jest.mock('@repo/auth', () => ({ auth: {} }));
jest.mock('better-auth/node', () => ({
  toNodeHandler: jest.fn(() => () => {}),
}));

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
