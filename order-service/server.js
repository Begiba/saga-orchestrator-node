const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const BASE = {
  inventory: 'http://inventory:3001',
  payment: 'http://payment:3002',
  shipping: 'http://shipping:3003'
};

app.post('/create-order', async (req, res) => {
  const { productId, userId } = req.body;

  try {
    await pool.query('INSERT INTO orders(user_id, product_id, status) VALUES ($1, $2, $3)', [userId, productId, 'initiated']);
    console.log(`[OrderService] Created order for ${userId}, ${productId}`);

    console.log('[OrderService] Reserving inventory...');
    await axios.post(`${BASE.inventory}/reserve`, { productId });

    console.log('[OrderService] Charging payment...');
    await axios.post(`${BASE.payment}/charge`, { userId });

    console.log('[OrderService] Scheduling shipping...');
    await axios.post(`${BASE.shipping}/ship`, { userId, productId });

    await pool.query('UPDATE orders SET status = $1 WHERE user_id = $2 AND product_id = $3', ['completed', userId, productId]);
    res.status(200).send('Order completed successfully.');
  } catch (err) {
    console.error('[OrderService] Error:', err.message);
    try {
      await axios.post(`${BASE.inventory}/release`, { productId });
      await axios.post(`${BASE.payment}/refund`, { userId });
      await pool.query('UPDATE orders SET status = $1 WHERE user_id = $2 AND product_id = $3', ['failed', userId, productId]);
    } catch (compErr) {
      console.error('[OrderService] Compensation failed:', compErr.message);
    }
    res.status(500).send('Order failed. Compensation triggered.');
  }
});

app.listen(3000, async () => {
  console.log('[OrderService] Running on port 3000');
  const client = await pool.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      product_id TEXT,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  client.release();
});