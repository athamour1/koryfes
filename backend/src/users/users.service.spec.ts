import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { Unit } from '../units/entities/unit.entity';
import { LocationsService } from '../locations/locations.service';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = { findOne: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(Unit), useValue: {} },
        { provide: LocationsService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('never looks up a reset token that is empty', async () => {
    // TypeORM drops undefined conditions, which would match the first user
    await expect(service.findByResetToken(undefined)).resolves.toBeNull();
    await expect(service.findByResetToken('')).resolves.toBeNull();
    expect(usersRepository.findOne).not.toHaveBeenCalled();
  });

  it('keeps isAdmin in sync when the role changes', async () => {
    await service.update(1, { role: UserRole.USER });
    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, role: UserRole.USER, isAdmin: false }),
    );
  });
});
