import 'reflect-metadata';
import { MediaModule } from './media.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

describe('MediaModule', () => {
  it('should be defined', () => {
    expect(new MediaModule()).toBeDefined();
  });

  it('should declare MediaController', () => {
    const controllers = Reflect.getMetadata('controllers', MediaModule) as any[];
    expect(controllers).toEqual(expect.arrayContaining([MediaController]));
  });

  it('should provide and export MediaService', () => {
    const providers = Reflect.getMetadata('providers', MediaModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', MediaModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([MediaService]));
    expect(exportsArr).toEqual(expect.arrayContaining([MediaService]));
  });
});
