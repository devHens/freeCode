import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespace';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(createAuthDto: CreateAuthDto) {
    const hash = await argon.hash(createAuthDto.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: createAuthDto.email,
          hash,
        },
      });

      return user;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentals already exists');
        }
      }
      throw err;
    }
  }
  async signin(createAuthDto: CreateAuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Credentals incorrect');
    }
    const passwordValid = await argon.verify(user.hash, createAuthDto.password);
    if (!passwordValid) {
      throw new ForbiddenException('Credentals incorrect');
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    return { access_token: token };
  }
}
