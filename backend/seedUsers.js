const { User } = require('./models');

async function seedUsers() {
    try {
        const adminExists = await User.findOne({ where: { username: 'admin' } });

        if (!adminExists) {
            await User.create({
                username: 'admin',
                password: 'admin123',
                role: 'ADMIN'
            });
            console.log('Default admin user created: username=admin, password=admin123');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

module.exports = seedUsers;
