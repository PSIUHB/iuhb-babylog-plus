import 'reflect-metadata';
import { AuthModule } from './auth.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy';
import { LocalStrategy } from '@/modules/auth/strategies/local.strategy';

describe('AuthModule', () => {
  it('should be defined', () => {
    expect(new AuthModule()).toBeDefined();
  });

  it('should declare AuthController', () => {
    const controllers = Reflect.getMetadata('controllers', AuthModule) as any[];
    expect(controllers).toEqual(expect.arrayContaining([AuthController]));
  });

  it('should provide and export AuthService and strategies', () => {
    const providers = Reflect.getMetadata('providers', AuthModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', AuthModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([AuthService, JwtStrategy, LocalStrategy]));
    expect(exportsArr).toEqual(expect.arrayContaining([AuthService]));
  });
});
