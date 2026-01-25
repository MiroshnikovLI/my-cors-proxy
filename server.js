const cors_proxy = require('cors-anywhere');
const express = require('express');

const app = express();
const port = process.env.PORT;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
});

// CORS preflight
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// CORS заголовки для всех ответов
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Прокси без проверки ключа
const proxy = cors_proxy.createServer({
  originWhitelist: [], // Разрешаем всем
  requireHeader: [],
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

// Запуск
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`📍 Port: ${port}`);
  console.log('='.repeat(50));
  console.log('📌 Usage:');
  console.log(`  GET  http://localhost:${port}/https://api.example.com/data`);
  console.log(`  POST http://localhost:${port}/https://api.example.com/endpoint`);
  console.log('='.repeat(50));
});