const { MasterData, sequelize } = require('./models');

const seedCategories = async () => {
    try {
        await sequelize.sync();

        const categories = [
            // Income
            { name: 'Penjualan Warung', type: 'INCOME' },
            { name: 'Jasa Brilink', type: 'INCOME' },
            { name: 'Jasa Topup', type: 'INCOME' },
            { name: 'Lainnya', type: 'INCOME' },

            // Expense
            { name: 'Belanja Stok', type: 'EXPENSE' },
            { name: 'Setor Tunai', type: 'EXPENSE' },
            { name: 'Operasional', type: 'EXPENSE' },
            { name: 'Gaji Karyawan', type: 'EXPENSE' },
            { name: 'Lainnya', type: 'EXPENSE' },
        ];

        for (const cat of categories) {
            const existing = await MasterData.findOne({ where: { name: cat.name, type: cat.type } });
            if (!existing) {
                await MasterData.create(cat);
                console.log(`Category ${cat.name} (${cat.type}) created.`);
            } else {
                console.log(`Category ${cat.name} already exists.`);
            }
        }
    } catch (error) {
        console.error('Error seeding categories:', error);
    }
};

seedCategories();
