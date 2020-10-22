import { TaskDescriptionPipe } from './task-description.pipe';

describe('TaskDescriptionPipe', () => {
  it('create an instance', () => {
    const pipe = new TaskDescriptionPipe();
    expect(pipe).toBeTruthy();
  });
});
