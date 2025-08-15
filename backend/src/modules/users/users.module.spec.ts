import 'reflect-metadata';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersModule', () => {
  it('should be defined', () => {
    expect(new UsersModule()).toBeDefined();
  });

  it('should provide and export UsersService', () => {
    const providers = Reflect.getMetadata('providers', UsersModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', UsersModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([UsersService]));
    expect(exportsArr).toEqual(expect.arrayContaining([UsersService]));
  });
});
