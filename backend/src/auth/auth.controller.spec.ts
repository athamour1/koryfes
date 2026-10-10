import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { validateUser: jest.fn(), login: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('logs in a valid user', async () => {
    authService.validateUser.mockResolvedValue({ id: 1 });
    authService.login.mockResolvedValue({ access_token: 'jwt' });

    await expect(controller.login({ username: 'u', password: 'p', rememberMe: true }))
      .resolves.toEqual({ access_token: 'jwt' });
    expect(authService.login).toHaveBeenCalledWith({ id: 1 }, true);
  });

  it('rejects invalid credentials', async () => {
    authService.validateUser.mockResolvedValue(null);
    await expect(controller.login({ username: 'u', password: 'bad' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });
});
