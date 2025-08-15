import 'reflect-metadata';
import { ChildrenModule } from './children.module';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';

describe('ChildrenModule', () => {
  it('should be defined', () => {
    expect(new ChildrenModule()).toBeDefined();
  });

  it('should declare the expected controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ChildrenModule) as any[];
    expect(Array.isArray(controllers)).toBe(true);
    expect(controllers).toEqual(expect.arrayContaining([ChildrenController]));
  });

  it('should provide and export ChildrenService', () => {
    const providers = Reflect.getMetadata('providers', ChildrenModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', ChildrenModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([ChildrenService]));
    expect(exportsArr).toEqual(expect.arrayContaining([ChildrenService]));
  });
});
