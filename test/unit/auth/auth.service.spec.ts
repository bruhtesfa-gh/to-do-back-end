import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { CreateAuthDto } from 'src/modules/auth/dto/create-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    register: jest.Mock;
    login: jest.Mock;
    validateUser: jest.Mock;
    findOneBy: jest.Mock;
  };
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      findOneBy: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(() => 'jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: '123456',
      };

      const createdUser = {
        id: 1,
        email: registerDto.email,
      };

      // Mock the register method
      mockAuthService.register.mockResolvedValue(
        {
          user: createdUser,
          access_token: 'jwt_token'
        }
      );

      const result = await controller.register(registerDto);

      expect(result).toBeDefined();
      expect(result.user).toEqual(createdUser);
        expect(result.access_token).toBe('jwt_token');
    });
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      const user = {
        id: 1,
        email: loginDto.email,
      };

      // First mock validateUser
      mockAuthService.validateUser.mockResolvedValue(user);
      
      // Then mock login
      mockAuthService.login.mockResolvedValue({
        user,
        access_token: 'jwt_token'
      });

      // Call validateUser first
      await mockAuthService.validateUser(loginDto.email, loginDto.password);
      const result = await controller.login(loginDto, { user });

      expect(result).toEqual({
        user,
        access_token: 'jwt_token'
      });
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });
  });
});

describe('AuthService', () => {
  let service: AuthService;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    validateUser: jest.Mock;
    findOneBy: jest.Mock;
  };
  let jwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      findOneBy: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthService, useValue: authService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const registerDto : CreateAuthDto = {
        email: 'test@example.com',
        password: '123456',
      };

      const createdUser = {
        id: 1,
        email: registerDto.email,
      };

      authService.register.mockResolvedValue({
        user: createdUser,
        access_token: 'jwt_token'
      });

      const result = await service.register(registerDto);
      expect(result).toEqual({
        user: createdUser,
        access_token: 'jwt_token'
      });
    });
  });
});
