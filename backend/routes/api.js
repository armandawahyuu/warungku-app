const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const transactionController = require('../controllers/transactionController');

const masterDataController = require('../controllers/masterDataController');
const reportController = require('../controllers/reportController');
const authController = require('../controllers/authController');

// Auth Routes (public)
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.verifyToken, authController.requireAdmin, authController.register);

// User Management (admin only)
router.get('/users', authController.verifyToken, authController.requireAdmin, authController.getUsers);
router.delete('/users/:id', authController.verifyToken, authController.requireAdmin, authController.deleteUser);

// Protected Routes (require authentication)
// Session Routes
router.post('/sessions/open', authController.verifyToken, sessionController.openSession);
router.post('/sessions/:id/close', authController.verifyToken, sessionController.closeSession);
router.get('/sessions/current', authController.verifyToken, sessionController.getCurrentSession);

// Transaction Routes
router.post('/transactions', authController.verifyToken, transactionController.addTransaction);
router.get('/transactions', authController.verifyToken, transactionController.getTransactions);

// Master Data Routes
router.get('/categories', authController.verifyToken, masterDataController.getCategories);
router.post('/categories', authController.verifyToken, masterDataController.createCategory);
router.delete('/categories/:id', authController.verifyToken, masterDataController.deleteCategory);

// Report Routes
router.get('/reports/monthly', authController.verifyToken, reportController.getMonthlyReport);

module.exports = router;
