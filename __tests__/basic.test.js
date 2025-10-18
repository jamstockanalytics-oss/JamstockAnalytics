/**
 * Basic Tests
 * Simple tests that don't require database or external services
 */

describe('Basic Functionality', () => {
  test('should pass basic arithmetic', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(8 / 2).toBe(4);
  });

  test('should handle strings correctly', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toContain('World');
    expect(greeting.length).toBe(13);
    expect(greeting.toUpperCase()).toBe('HELLO, WORLD!');
  });

  test('should work with arrays', () => {
    const fruits = ['apple', 'banana', 'orange'];
    expect(fruits).toHaveLength(3);
    expect(fruits).toContain('banana');
    expect(fruits[0]).toBe('apple');
  });

  test('should work with objects', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
    expect(user.name).toBe('John Doe');
    expect(user.email).toContain('@');
    expect(user.age).toBeGreaterThan(18);
  });

  test('should handle async operations', async () => {
    const promise = Promise.resolve('test value');
    const result = await promise;
    expect(result).toBe('test value');
  });
});

describe('Environment Configuration', () => {
  test('should have test environment set', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('should have MongoDB URI configured for tests', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toContain('test');
  });
});
