const express = require('express');
const dns = require('dns');
// Force IPv4 to avoid ENETUNREACH errors with Supabase on Render
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const cors = require('cors');
const { sequelize } = require('./models');
const apiRoutes = require('./routes/api');
const seedUsers = require('./seedUsers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001; // Use env port or default to 5001

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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

