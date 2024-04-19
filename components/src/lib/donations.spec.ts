import { Donations } from './donations';

describe('Donations', () => {
  it('should work', () => {
    expect(new Donations()).toMatchSnapshot();
  });
});
