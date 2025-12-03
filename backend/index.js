const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const apiRoutes = require('./routes/api');
const seedUsers = require('./seedUsers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// Sync database and start server
// Sync database and start server
if (require.main === module) {
    sequelize.sync({ alter: true }).then(async () => {
        console.log('Database synced');
        await seedUsers(); // Create default admin user
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }).catch(err => {
        console.error('Database sync error:', err);
    });
}

module.exports = app;

