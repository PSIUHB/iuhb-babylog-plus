import 'reflect-metadata';
import { EventsModule } from './events.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsModule', () => {
  it('should be defined', () => {
    expect(new EventsModule()).toBeDefined();
  });

  it('should declare EventsController', () => {
    const controllers = Reflect.getMetadata('controllers', EventsModule) as any[];
    expect(controllers).toEqual(expect.arrayContaining([EventsController]));
  });

  it('should provide and export EventsService', () => {
    const providers = Reflect.getMetadata('providers', EventsModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', EventsModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([EventsService]));
    expect(exportsArr).toEqual(expect.arrayContaining([EventsService]));
  });
});
