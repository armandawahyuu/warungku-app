const { Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and Year are required' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Fetch all transactions for the month
        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['createdAt', 'ASC']]
        });

        // Calculate Summary
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'INCOME') totalIncome += Number(t.amount);
            if (t.type === 'EXPENSE') totalExpense += Number(t.amount);
        });

        const netProfit = totalIncome - totalExpense;

        // Aggregate Daily Data for Chart
        const dailyData = {};

        // Initialize all days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            dailyData[i] = { date: i, income: 0, expense: 0 };
        }

        transactions.forEach(t => {
            const day = new Date(t.createdAt).getDate();
            if (t.type === 'INCOME') dailyData[day].income += Number(t.amount);
            if (t.type === 'EXPENSE') dailyData[day].expense += Number(t.amount);
        });

        res.json({
            summary: {
                totalIncome,
                totalExpense,
                netProfit
            },
            daily: Object.values(dailyData),
            transactions
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
