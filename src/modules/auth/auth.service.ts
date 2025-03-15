import {
  Injectable,
  // UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private authRepository: Repository<User>,
  ) {}

  async register(createAuthDto: CreateAuthDto): Promise<any> {
    const { email, password } = createAuthDto;
    const existingUser = await this.authRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = this.authRepository.create({ email, passwordHash });
    const user = await this.authRepository.save(newUser);
    return this.login(user);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: jwt.sign(
        payload,
            process.env.JWT_SECRET || 'super_secret_007',
            { expiresIn: '1h' },
          ),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    const user = await this.authRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async findOneBy(criteria: Partial<User>): Promise<User> {
    return this.authRepository.findOne({ where: criteria });
  }
}
