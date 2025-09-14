// Simple test to verify Jest setup
describe('Test Setup', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('Basic assertions work', () => {
    expect('hello').toBe('hello');
    expect([1, 2, 3]).toHaveLength(3);
    expect({ name: 'test' }).toHaveProperty('name', 'test');
  });
});
