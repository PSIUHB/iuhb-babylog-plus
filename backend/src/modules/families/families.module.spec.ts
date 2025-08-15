import 'reflect-metadata';
import { FamiliesModule } from './families.module';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';

describe('FamiliesModule', () => {
  it('should be defined', () => {
    expect(new FamiliesModule()).toBeDefined();
  });

  it('should declare FamiliesController', () => {
    const controllers = Reflect.getMetadata('controllers', FamiliesModule) as any[];
    expect(controllers).toEqual(expect.arrayContaining([FamiliesController]));
  });

  it('should provide and export FamiliesService', () => {
    const providers = Reflect.getMetadata('providers', FamiliesModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', FamiliesModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([FamiliesService]));
    expect(exportsArr).toEqual(expect.arrayContaining([FamiliesService]));
  });
});
