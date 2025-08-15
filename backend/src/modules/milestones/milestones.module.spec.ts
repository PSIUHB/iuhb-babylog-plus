import 'reflect-metadata';
import { MilestonesModule } from './milestones.module';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';

describe('MilestonesModule', () => {
  it('should be defined', () => {
    expect(new MilestonesModule()).toBeDefined();
  });

  it('should declare MilestonesController', () => {
    const controllers = Reflect.getMetadata('controllers', MilestonesModule) as any[];
    expect(controllers).toEqual(expect.arrayContaining([MilestonesController]));
  });

  it('should provide and export MilestonesService', () => {
    const providers = Reflect.getMetadata('providers', MilestonesModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', MilestonesModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([MilestonesService]));
    expect(exportsArr).toEqual(expect.arrayContaining([MilestonesService]));
  });
});
