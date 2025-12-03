const { Wallet, sequelize } = require('./models');

const seedWallets = async () => {
    try {
        await sequelize.sync(); // Ensure tables exist

        const wallets = [
            { name: 'LACI1', type: 'PHYSICAL' },
            { name: 'LACI2', type: 'PHYSICAL' },
            { name: 'BRILINK', type: 'DIGITAL' },
            { name: 'DANA', type: 'DIGITAL' },
            { name: 'DIGIPOS', type: 'DIGITAL' },
        ];

        for (const w of wallets) {
            const existing = await Wallet.findOne({ where: { name: w.name } });
            if (!existing) {
                await Wallet.create(w);
                console.log(`Wallet ${w.name} created.`);
            } else {
                console.log(`Wallet ${w.name} already exists.`);
            }
        }
    } catch (error) {
        console.error('Error seeding wallets:', error);
    }
};

seedWallets();
