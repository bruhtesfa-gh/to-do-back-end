import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { CreateAuthDto } from 'src/modules/auth/dto/create-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    validateUser: jest.Mock;
    findOneBy: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const registerDto = {
      email: 'test@example.com',
      password: '123456',
      name: null,
    };

    const expectedResponse = {
      user: {
        id: 1,
        email: registerDto.email,
        name: null,
      },
      access_token: 'jwt_token'
    };

    authService.register.mockResolvedValue(expectedResponse);
    const result = await controller.register(registerDto);
    expect(result).toEqual(expectedResponse);
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: null,
      };

      const expectedResult = {
        access_token: 'jwt_token',
        user: mockUser,
      };

      const loginDto : CreateAuthDto = {
        email: 'test@example.com',
        password: '123456',
      };

      authService.login.mockResolvedValue(expectedResult);
      const result = await controller.login(loginDto, { user: mockUser });
      expect(result).toEqual(expectedResult);
    });
  });
});
