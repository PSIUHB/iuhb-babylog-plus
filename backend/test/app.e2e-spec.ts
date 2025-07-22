import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Module } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';

import { Controller, Get } from '@nestjs/common';

// Create a simple controller that returns "Hello World!"
@Controller()
class AppController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}

// Create a simple test module with the controller
@Module({
  controllers: [AppController],
})
class TestAppModule {}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
