import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { CreateAuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3000);
    prisma = moduleRef.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(async () => {
    await app.close();
  });
  const dto: CreateAuthDto = {
    email: 'test@test.com',
    password: 'test',
  };
  describe('Auth', () => {
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if email not found', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            email: 'notfound@test.com',
            password: dto.password,
          })
          .expectStatus(403);
      });
      it('should throw if password incorrect', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({
            email: dto.email,
            password: 'incorrect',
          })
          .expectStatus(403);
      });
    });

    describe('Signin', () => {
      it('should signin', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('Users', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('should edit current user', () => {
        const dto: EditUserDto={
          firstName:"Hello",
          email: "jvvvvla@gmail.com"
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Create bookmark', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmark by Id', () => {});
    describe('Edit bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});
