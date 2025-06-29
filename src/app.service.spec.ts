// app.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  // Test case 1: Test if the service is defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test case 2: Test if the addNumbers function works correctly
  it('should correctly add two numbers', () => {
    const result = service.addNumbers(2, 3);
    expect(result).toBe(5);
  });

  // Test case 3: Test if the addNumbers function handles negative numbers
  it('should correctly add negative numbers', () => {
    const result = service.addNumbers(-2, -3);
    expect(result).toBe(-5);
  });

  // Test case 4: Test if the addNumbers function handles zero
  it('should return the number itself when adding 0', () => {
    const result = service.addNumbers(0, 5);
    expect(result).toBe(5);
  });
});
