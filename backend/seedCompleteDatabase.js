const { sequelize } = require('./models');
const { User, Wallet, MasterData } = require('./models');
const bcrypt = require('bcrypt');

async function seedCompleteDatabase() {
    try {
        console.log('🔄 Connecting to Supabase...');
        await sequelize.authenticate();
        console.log('✅ Connected!');

        // Sync all tables
        await sequelize.sync({ alter: false });
        console.log('✅ Database synced');

        // 1. Create Admin User
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                role: 'ADMIN'
            });
            console.log('✅ Admin user created');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // 2. Create Wallets
        const walletData = [
            { name: 'Kas', type: 'PHYSICAL', isActive: true },
            { name: 'Bank BCA', type: 'DIGITAL', isActive: true },
            { name: 'E-Wallet (OVO)', type: 'DIGITAL', isActive: true }
        ];

        for (const wallet of walletData) {
            const exists = await Wallet.findOne({ where: { name: wallet.name } });
            if (!exists) {
                await Wallet.create(wallet);
                console.log(`✅ Wallet "${wallet.name}" created`);
            }
        }

        // 3. Create Master Data (Categories)
        const categories = [
            { type: 'INCOME', name: 'Penjualan' },
            { type: 'INCOME', name: 'Lain-lain' },
            { type: 'EXPENSE', name: 'Belanja Barang' },
            { type: 'EXPENSE', name: 'Operasional' },
            { type: 'EXPENSE', name: 'Gaji' },
            { type: 'EXPENSE', name: 'Lain-lain' }
        ];

        for (const category of categories) {
            const exists = await MasterData.findOne({
                where: { type: category.type, name: category.name }
            });
            if (!exists) {
                await MasterData.create(category);
                console.log(`✅ Category "${category.type} - ${category.name}" created`);
            }
        }

        console.log('\n🎉 Database seeding completed!');
        console.log('\n📋 Summary:');
        console.log('   - Admin user: admin / admin123');
        console.log('   - Wallets: Kas, Bank BCA, E-Wallet (OVO)');
        console.log('   - Income categories: Penjualan, Lain-lain');
        console.log('   - Expense categories: Belanja Barang, Operasional, Gaji, Lain-lain');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedCompleteDatabase();
