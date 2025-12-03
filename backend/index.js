const express = require('express');
const cors = require('cors');
const dns = require('dns').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Async start function to handle DNS resolution before DB connection
async function startServer() {
    try {
        // Resolve Supabase Host to IPv4 to avoid ENETUNREACH (IPv6) errors
        if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
            console.log(`Resolving DB_HOST: ${process.env.DB_HOST}`);
            try {
                const addresses = await dns.resolve4(process.env.DB_HOST);
                if (addresses && addresses.length > 0) {
                    console.log(`Resolved to IPv4: ${addresses[0]}`);
                    process.env.DB_HOST = addresses[0];
                }
            } catch (dnsError) {
                console.error('DNS Resolution failed, using original host:', dnsError);
            }
        }

        // Require models and routes AFTER resolving IP
        // This ensures config/database.js uses the resolved IPv4 address
        const { sequelize } = require('./models');
        const apiRoutes = require('./routes/api');
        const seedUsers = require('./seedUsers');

        app.use('/api', apiRoutes);

        await sequelize.sync({ alter: true });
        console.log('Database synced');

        await seedUsers(); // Create default admin user

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

// Start the server if run directly
if (require.main === module) {
    startServer();
}

module.exports = app;
