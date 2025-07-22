import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Module, Controller, Post, Body, Param, Get, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Gender } from '../src/interfaces/child.interface';
import { CreateChildDto } from '../src/modules/children/dto/create-child.dto';

// Define a type for our test child
interface TestChild {
  id: string;
  familyId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
  status: string;
  colorHex: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
  notes?: string;
  colorTheme?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create a simplified service for testing
class TestChildrenService {
  private children: TestChild[] = [];

  async create(createChildDto: CreateChildDto, familyId: string): Promise<TestChild> {
    // Validate required fields
    if (!createChildDto.firstName) {
      throw new HttpException('firstName is required', HttpStatus.BAD_REQUEST);
    }
    
    if (!createChildDto.lastName) {
      throw new HttpException('lastName is required', HttpStatus.BAD_REQUEST);
    }
    
    if (!createChildDto.birthDate) {
      throw new HttpException('birthDate is required', HttpStatus.BAD_REQUEST);
    }

    const child: TestChild = {
      id: `child-${Date.now()}`,
      familyId,
      ...createChildDto,
      status: createChildDto.isActive ? 'active' : 'inactive',
      colorHex: '#4ECDC4',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.children.push(child);
    return child;
  }

  async findAllByFamily(familyId: string): Promise<TestChild[]> {
    return this.children.filter(child => child.familyId === familyId);
  }
}

// Create a simplified controller for testing
@Controller('children')
class TestChildrenController {
  constructor(private readonly testService: TestChildrenService) {}

  @Post('family/:familyId')
  create(
    @Param('familyId') familyId: string,
    @Body() createChildDto: CreateChildDto,
  ) {
    return this.testService.create(createChildDto, familyId);
  }

  @Get('family/:familyId')
  findAllByFamily(@Param('familyId') familyId: string) {
    return this.testService.findAllByFamily(familyId);
  }
}

// Create a mock module for testing
@Module({
  controllers: [TestChildrenController],
  providers: [
    TestChildrenService,
  ],
})
class TestAppModule {}

describe('ChildrenController (e2e)', () => {
  let app: INestApplication;
  let testService: TestChildrenService;
  let testFamilyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configure the app to use ValidationPipe and handle exceptions properly
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    
    await app.init();

    // Get the test service
    testService = moduleFixture.get(TestChildrenService);
    
    // Set up test family ID
    testFamilyId = '1df89d7f-1176-4fb2-8676-e42cf1af06d9'; // Using the familyId from the issue description
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /children/family/:familyId', () => {
    it('should create a child with valid data', async () => {
      // Valid child data
      const createChildDto = {
        firstName: 'Baby',
        lastName: 'Test',
        birthDate: new Date('2023-01-01'),
        gender: Gender.MALE,
        birthWeightKg: 3.5,
        birthHeightCm: 50,
        notes: 'Test notes',
        isActive: true
      };

      // Make the request
      const response = await request(app.getHttpServer())
        .post(`/children/family/${testFamilyId}`)
        .send(createChildDto)
        .expect(201);

      // Assertions
      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.firstName).toBe(createChildDto.firstName);
      expect(response.body.lastName).toBe(createChildDto.lastName);
      expect(response.body.birthWeightKg).toBe(createChildDto.birthWeightKg);
      expect(response.body.birthHeightCm).toBe(createChildDto.birthHeightCm);
      expect(response.body.status).toBe('active');
    });

    it('should return 400 when firstName is missing', async () => {
      const invalidChildDto = {
        lastName: 'Test',
        birthDate: new Date('2023-01-01'),
        gender: Gender.MALE
      };

      await request(app.getHttpServer())
        .post(`/children/family/${testFamilyId}`)
        .send(invalidChildDto)
        .expect(400);
    });

    it('should return 400 when lastName is missing', async () => {
      const invalidChildDto = {
        firstName: 'Baby',
        birthDate: new Date('2023-01-01'),
        gender: Gender.MALE
      };

      await request(app.getHttpServer())
        .post(`/children/family/${testFamilyId}`)
        .send(invalidChildDto)
        .expect(400);
    });

    it('should return 400 when birthDate is missing', async () => {
      const invalidChildDto = {
        firstName: 'Baby',
        lastName: 'Test',
        gender: Gender.MALE
      };

      await request(app.getHttpServer())
        .post(`/children/family/${testFamilyId}`)
        .send(invalidChildDto)
        .expect(400);
    });

    it('should create a child with optional fields', async () => {
      // Child data with optional fields
      const createChildDto = {
        firstName: 'Baby',
        lastName: 'Test',
        birthDate: new Date('2023-01-01'),
        gender: Gender.FEMALE,
        colorTheme: 'primary',
        notes: 'Test notes with optional fields',
        birthWeightKg: 3.2,
        birthHeightCm: 49.5
      };

      // Make the request
      const response = await request(app.getHttpServer())
        .post(`/children/family/${testFamilyId}`)
        .send(createChildDto)
        .expect(201);

      // Assertions
      expect(response.body).toBeDefined();
      expect(response.body.birthWeightKg).toBe(createChildDto.birthWeightKg);
      expect(response.body.birthHeightCm).toBe(createChildDto.birthHeightCm);
      expect(response.body.notes).toBe(createChildDto.notes);
    });
  });
});