const { sequelize } = require('./models');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function resetPassword() {
    try {
        await sequelize.authenticate();

        const user = await User.findOne({ where: { username: 'owner' } });
        if (!user) {
            console.log('User not found');
            return;
        }

        const newPassword = await bcrypt.hash('owner123', 10);
        await user.update({ password: newPassword });

        console.log('✅ Password reset successfully!');
        console.log('   Username: owner');
        console.log('   Password: owner123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetPassword();
