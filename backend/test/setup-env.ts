// Run the real AppModule against a throwaway in-memory SQLite database
process.env.NODE_ENV = 'test';
process.env.DB_TYPE = 'sqlite';
process.env.DB_DATABASE = ':memory:';
process.env.JWT_SECRET = 'e2e-test-secret';
// Tests seed their own users; don't auto-create the env admin
delete process.env.ADMIN_USERNAME;
delete process.env.ADMIN_PASSWORD;
