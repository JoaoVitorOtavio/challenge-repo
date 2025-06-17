import { HttpException } from '@nestjs/common';

export async function expectToThrow<T extends HttpException>(
  fn: () => Promise<unknown>,
  expectedException: new (...args: any[]) => T,
  expectedMessage?: string,
  shouldForceFail?: boolean,
) {
  try {
    await fn();

    if (shouldForceFail) {
      fail(`Should have thrown an error`);
    }
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(expectedException);
    if (expectedMessage) {
      expect((error as HttpException).message).toBe(expectedMessage);
    }
  }
}
