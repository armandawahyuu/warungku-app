const { sequelize } = require('./models');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function seedToCloud() {
    try {
        console.log('Connecting to Supabase database...');
        await sequelize.authenticate();
        console.log('Connected successfully!');

        // Sync database (create tables if not exist)
        await sequelize.sync({ force: false });
        console.log('Database synced');

        // Check if owner exists
        const existingOwner = await User.findOne({ where: { username: 'owner' } });
        if (existingOwner) {
            console.log('User "owner" already exists');
            return;
        }

        // Create owner user
        const hashedPassword = await bcrypt.hash('owner123', 10);
        await User.create({
            username: 'owner',
            password: hashedPassword,
            role: 'ADMIN'
        });
        console.log('✅ User "owner" created successfully!');
        console.log('   Username: owner');
        console.log('   Password: owner123');
        console.log('   Role: ADMIN');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedToCloud();
