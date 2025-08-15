import 'reflect-metadata';
import { MailModule } from './mail.module';
import { MailService } from './mail.service';

describe('MailModule', () => {
  it('should be defined', () => {
    expect(new MailModule()).toBeDefined();
  });

  it('should provide and export MailService', () => {
    const providers = Reflect.getMetadata('providers', MailModule) as any[];
    const exportsArr = Reflect.getMetadata('exports', MailModule) as any[];
    expect(providers).toEqual(expect.arrayContaining([MailService]));
    expect(exportsArr).toEqual(expect.arrayContaining([MailService]));
  });
});
