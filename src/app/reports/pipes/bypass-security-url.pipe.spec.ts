import { BypassSecurityURLPipe } from './bypass-security-url.pipe';

describe('BypassSecurityURLPipe', () => {
  it('create an instance', () => {
    const pipe = new BypassSecurityURLPipe(null);
    expect(pipe).toBeTruthy();
  });
});
