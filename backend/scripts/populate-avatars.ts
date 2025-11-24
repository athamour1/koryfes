import { DataSource } from 'typeorm';

// Avatar configuration options - matching beanheads library
const avatarOptions = {
    skinTone: ['light', 'yellow', 'brown', 'dark', 'red', 'black'],
    eyes: ['normal', 'leftTwitch', 'happy', 'content', 'squint', 'simple', 'dizzy', 'wink', 'heart'],
    eyebrows: ['raised', 'leftLowered', 'serious', 'angry', 'concerned'],
    mouth: ['grin', 'sad', 'openSmile', 'lips', 'open'],
    hair: ['short', 'long', 'bun', 'pixie', 'balding', 'buzz', 'afro', 'bob'],
    clothing: ['shirt', 'dressShirt', 'vneck', 'tankTop', 'dress'],
    accessory: ['none', 'roundGlasses', 'tinyGlasses', 'shades'],
    hat: ['none', 'beanie', 'turban'],
    body: ['chest', 'breasts'],
    hairColor: ['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'],
    clothingColor: ['white', 'blue', 'black', 'green', 'red'],
    circleColor: ['blue', 'green', 'red', 'pink'],
    lipColor: ['red', 'purple', 'pink', 'turquoise', 'green'],
    hatColor: ['white', 'blue', 'black', 'green', 'red'],
};

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomAvatar() {
    return {
        skinTone: getRandomItem(avatarOptions.skinTone),
        eyes: getRandomItem(avatarOptions.eyes),
        eyebrows: getRandomItem(avatarOptions.eyebrows),
        mouth: getRandomItem(avatarOptions.mouth),
        hair: getRandomItem(avatarOptions.hair),
        clothing: getRandomItem(avatarOptions.clothing),
        accessory: getRandomItem(avatarOptions.accessory),
        hat: getRandomItem(avatarOptions.hat),
        body: getRandomItem(avatarOptions.body),
        hairColor: getRandomItem(avatarOptions.hairColor),
        clothingColor: getRandomItem(avatarOptions.clothingColor),
        circleColor: getRandomItem(avatarOptions.circleColor),
        lipColor: getRandomItem(avatarOptions.lipColor),
        hatColor: getRandomItem(avatarOptions.hatColor),
        lashes: Math.random() < 0.5,
        faceMask: Math.random() < 0.05, // 5% chance
        mask: true,
        facialHair: Math.random() < 0.3 ? getRandomItem(['none', 'stubble', 'mediumBeard']) : 'none',
        graphic: Math.random() < 0.1 ? getRandomItem(['vue', 'react', 'gatsby']) : 'none',
    };
}

async function populateAvatars() {
    // Create DataSource
    const AppDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'scout_badges',
    });

    try {
        // Initialize connection
        await AppDataSource.initialize();
        console.log('Database connection established');

        // Get all users
        const users = await AppDataSource.query('SELECT id, username FROM users');
        console.log(`Found ${users.length} users`);

        // Update each user with a random avatar
        let updatedCount = 0;
        for (const user of users) {
            const avatarConfig = generateRandomAvatar();

            await AppDataSource.query(
                'UPDATE users SET "avatarConfig" = $1 WHERE id = $2',
                [JSON.stringify(avatarConfig), user.id]
            );

            updatedCount++;
            console.log(`Updated user ${user.username} (${updatedCount}/${users.length})`);
        }

        console.log(`\n✅ Successfully updated ${updatedCount} users with randomized avatars!`);
    } catch (error) {
        console.error('Error populating avatars:', error);
        process.exit(1);
    } finally {
        await AppDataSource.destroy();
        console.log('Database connection closed');
    }
}

// Run the script
populateAvatars()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
