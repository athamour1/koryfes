import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProgressService } from '../user-progress/user-progress.service';
import { UserRole } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = { create: jest.fn(), update: jest.fn(), findOne: jest.fn(), getUnitLocationId: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: UserProgressService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('forces admins to create plain users in their own location', async () => {
    await controller.create(
      { username: 'n', password: 'p', role: UserRole.SUPER_ADMIN, locationName: 'Elsewhere' },
      { user: { role: 'admin', locationId: 3 } },
    );
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.USER, location: { id: 3 } }),
    );
    expect(usersService.create.mock.calls[0][0]).not.toHaveProperty('locationName');
  });

  it('strips role and location from admin updates', async () => {
    usersService.findOne.mockResolvedValue({ id: 5, role: 'user', location: { id: 3 } });
    await controller.updateUser(
      '5',
      { username: 'x', role: UserRole.SUPER_ADMIN, locationName: 'Elsewhere' },
      { user: { role: 'admin', locationId: 3 } },
    );
    expect(usersService.update).toHaveBeenCalledWith(5, { username: 'x' });
  });
});
