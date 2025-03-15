export const mockJwtService = {
  sign: jest.fn(() => 'test_token'),
  verify: jest.fn(),
};

export const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'JWT_SECRET':
        return 'super_secret_007';
      default:
        return null;
    }
  }),
};
