const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();

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

app.use(verifyToken);

app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:8001', changeOrigin: true }));
app.use('/api/fleet', createProxyMiddleware({ target: 'http://localhost:8002', changeOrigin: true }));
app.use('/api/bookings', createProxyMiddleware({ target: 'http://localhost:8003', changeOrigin: true }));

app.listen(8000, () => console.log('API Gateway berjalan di port 8000'));