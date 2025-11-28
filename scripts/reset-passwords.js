const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Database configuration from environment or defaults
const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'scout_badges',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function resetAllPasswords() {
    const newPassword = 'test';
    const saltRounds = 10;

    try {
        console.log('🔐 Connecting to database...');

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        console.log('✅ Password hashed successfully');

        // Update all users
        const result = await pool.query(
            'UPDATE "user" SET password = $1',
            [hashedPassword]
        );

        console.log(`✅ Successfully reset password for ${result.rowCount} users`);
        console.log(`📝 All user passwords are now: "${newPassword}"`);

    } catch (error) {
        console.error('❌ Error resetting passwords:', error);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('👋 Database connection closed');
    }
}

// Run the script
resetAllPasswords();
