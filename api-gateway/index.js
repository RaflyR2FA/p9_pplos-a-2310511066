const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Terlalu banyak permintaan, coba lagi nanti." }
});

const verifyToken = (req, res, next) => {
    if (req.path.startsWith('/api/auth/login') || req.path.startsWith('/api/auth/register')) {
        return next();
    }
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.headers['x-user-id'] = decoded.id;
        req.headers['x-user-role'] = decoded.role;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token tidak valid atau kadaluarsa.' });
    }
};

const checkAdminOrCrew = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole === 'Admin' || userRole === 'Crew') {
        return next();
    }
    return res.status(403).json({ error: 'Akses ditolak. Fitur ini hanya untuk Admin dan Crew.' });
};

app.use(limiter);
app.use(verifyToken);

app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:3137', changeOrigin: true }));
app.use('/api/fleet', createProxyMiddleware({ target: 'http://localhost:3138', changeOrigin: true }));
app.use('/api/expenses', checkAdminOrCrew, createProxyMiddleware({ target: 'http://localhost:3139/api/expenses', changeOrigin: true }));
app.use('/api/ml', verifyToken, checkAdminOrCrew, createProxyMiddleware({ target: 'http://localhost:3140', changeOrigin: true, pathRewrite: { '^/api/ml': '' }}));

app.listen(3136, () => console.log('API Gateway berjalan di port 3136'));