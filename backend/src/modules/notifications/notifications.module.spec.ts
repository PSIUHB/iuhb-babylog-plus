import 'reflect-metadata';
import { NotificationsModule } from './notifications.module';

describe('NotificationsModule', () => {
  it('should be defined', () => {
    expect(new NotificationsModule()).toBeDefined();
  });

  it('should have no controllers, providers, or exports by default', () => {
    const controllers = Reflect.getMetadata('controllers', NotificationsModule) as any[];
    const providers = Reflect.getMetadata('providers', NotificationsModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', NotificationsModule) as any[];
    expect(controllers).toEqual([]);
    expect(providers).toEqual([]);
    expect(exportsArr).toEqual([]);
  });
});
