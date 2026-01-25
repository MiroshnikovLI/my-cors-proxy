const cors_proxy = require('cors-anywhere');
const express = require('express');

const app = express();
const port = process.env.PORT;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'cors-proxy'
  });
});

// Прокси с отключенным требованием заголовков
const proxy = cors_proxy.createServer({
  requireHeader: [], // ← ВАЖНО: отключаем требование заголовков
  removeHeaders: ['cookie', 'cookie2']
});

// Все запросы через прокси
app.use('/', (req, res) => {
  console.log(`Proxying: ${req.method} ${req.url}`);
  
  try {
    req.url = req.url.replace(/^\//, '/');
    proxy.emit('request', req, res);
  } catch (error) {
    res.status(500).json({ 
      error: 'Proxy error'
    });
  }
});

// CORS заголовки для всех ответов
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// CORS preflight
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.sendStatus(200);
});

// Запуск
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`🚀 CORS Proxy Server`);
  console.log(`📍 Port: ${port}`);
  console.log('='.repeat(50));
  console.log('✅ No API key required');
  console.log('✅ No Origin header required');
  console.log('='.repeat(50));
});