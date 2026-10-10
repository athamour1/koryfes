import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = { findByUsername: jest.fn(), findByResetToken: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('jwt') } },
        { provide: getRepositoryToken(RefreshToken), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('validates a correct password and strips the hash', async () => {
    usersService.findByUsername.mockResolvedValue({ id: 1, password: await bcrypt.hash('secret', 4) });
    await expect(service.validateUser('u', 'secret')).resolves.toEqual({ id: 1 });
  });

  it('rejects a wrong password', async () => {
    usersService.findByUsername.mockResolvedValue({ id: 1, password: await bcrypt.hash('secret', 4) });
    await expect(service.validateUser('u', 'nope')).resolves.toBeNull();
  });

  it('refuses a password reset without a token', async () => {
    await expect(service.resetPassword('', 'NewPassword1')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.findByResetToken).not.toHaveBeenCalled();
  });

  it('stores only a hash of the reset token', async () => {
    usersService.findByUsername.mockResolvedValue({ id: 7, username: 'u' });
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    await service.forgotPassword('u');
    const issued = String(log.mock.calls[0][0]).split(': ').pop();
    log.mockRestore();

    const stored = usersService.update.mock.calls[0][1].resetPasswordToken;
    expect(stored).toMatch(/^[0-9a-f]{64}$/);
    expect(stored).not.toEqual(issued);
  });
});
