import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'JWT_SECRET') {
        return 'super_secret_007';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should validate and return user payload', async () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: payload.sub,
        email: payload.email,
      });
    });
  });
});
