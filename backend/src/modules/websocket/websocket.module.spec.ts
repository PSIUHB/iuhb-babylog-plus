import 'reflect-metadata';
import { WebSocketModule } from './websocket.module';
import { WebSocketGateway } from './websocket.gateway';

describe('WebSocketModule', () => {
  it('should be defined', () => {
    expect(new WebSocketModule()).toBeDefined();
  });

  it('should provide and export WebSocketGateway', () => {
    const providers = Reflect.getMetadata('providers', WebSocketModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', WebSocketModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([WebSocketGateway]));
    expect(exportsArr).toEqual(expect.arrayContaining([WebSocketGateway]));
  });
});
