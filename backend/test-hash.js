const bcrypt = require('bcrypt');

const password = 'test';
const hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

bcrypt.compare(password, hash).then(result => {
    console.log('Password "test" matches hash:', result);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
