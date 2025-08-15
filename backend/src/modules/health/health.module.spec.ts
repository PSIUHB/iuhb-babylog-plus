import 'reflect-metadata';
import { HealthModule } from './health.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthModule', () => {
  it('should be defined', () => {
    expect(new HealthModule()).toBeDefined();
  });

  it('should declare HealthController', () => {
    const controllers = Reflect.getMetadata('controllers', HealthModule) as any[];
    expect(controllers).toEqual(expect.arrayContaining([HealthController]));
  });

  it('should provide HealthService', () => {
    const providers = Reflect.getMetadata('providers', HealthModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([HealthService]));
  });
});
