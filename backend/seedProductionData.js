const { sequelize } = require('./models');
const { Wallet, MasterData } = require('./models');

async function seedProductionData() {
    try {
        console.log('🔄 Connecting to Supabase...');
        await sequelize.authenticate();
        console.log('✅ Connected!');

        // 1. Seed Wallets
        const wallets = [
            { name: 'LACI1', type: 'PHYSICAL', isActive: true },
            { name: 'LACI2', type: 'PHYSICAL', isActive: true },
            { name: 'BRILINK', type: 'DIGITAL', isActive: true },
            { name: 'DANA', type: 'DIGITAL', isActive: true },
            { name: 'DIGIPOS', type: 'DIGITAL', isActive: true },
            { name: 'Gopay', type: 'DIGITAL', isActive: true }
        ];

        console.log('\n📦 Seeding Wallets...');
        for (const wallet of wallets) {
            const exists = await Wallet.findOne({ where: { name: wallet.name } });
            if (!exists) {
                await Wallet.create(wallet);
                console.log(`   ✅ ${wallet.name} (${wallet.type})`);
            } else {
                console.log(`   ⏭️  ${wallet.name} already exists`);
            }
        }

        // 2. Seed Categories
        const categories = [
            // Income
            { type: 'INCOME', name: 'Di kasi ude' },
            { type: 'INCOME', name: 'Jasa Brilink' },
            { type: 'INCOME', name: 'Jasa Topup' },
            { type: 'INCOME', name: 'Lainnya' },
            { type: 'INCOME', name: 'Penjualan Warung' },
            { type: 'INCOME', name: 'DI KIRIM UDE' },
            { type: 'INCOME', name: 'VOUCHER WIFI' },

            // Expense
            { type: 'EXPENSE', name: 'Belanja Stok' },
            { type: 'EXPENSE', name: 'disetor ke ude' },
            { type: 'EXPENSE', name: 'Gaji Karyawan' },
            { type: 'EXPENSE', name: 'Lainnya' },
            { type: 'EXPENSE', name: 'Operasional' },
            { type: 'EXPENSE', name: 'Setor Tunai' },
            { type: 'EXPENSE', name: 'LISTRIK' }
        ];

        console.log('\n📋 Seeding Categories...');
        for (const category of categories) {
            const exists = await MasterData.findOne({
                where: { type: category.type, name: category.name }
            });
            if (!exists) {
                await MasterData.create(category);
                console.log(`   ✅ ${category.type} - ${category.name}`);
            } else {
                console.log(`   ⏭️  ${category.type} - ${category.name} already exists`);
            }
        }

        console.log('\n🎉 Production data seeding completed!');
        console.log('\n📊 Summary:');
        console.log(`   Wallets: ${wallets.length} items`);
        console.log(`   Categories: ${categories.length} items`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedProductionData();
