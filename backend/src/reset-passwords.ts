import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

async function resetPasswords() {
    console.log('🔐 Starting password reset script...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    try {
        const newPassword = 'test';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Get all users
        const users = await usersService.findAll();
        console.log(`📝 Found ${users.length} users`);

        // Update each user's password
        let count = 0;
        for (const user of users) {
            await usersService.update(user.id, { password: hashedPassword });
            count++;
        }

        console.log(`✅ Successfully reset password for ${count} users`);
        console.log(`📝 All user passwords are now: "${newPassword}"`);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await app.close();
    }
}

resetPasswords();
