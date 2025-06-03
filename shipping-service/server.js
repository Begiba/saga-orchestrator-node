const express = require('express');
const app = express();
app.use(express.json());

app.post('/ship', (req, res) => {
  const { userId, productId } = req.body;
  console.log(`[ShippingService] Shipping ${productId} to ${userId}`);
  res.send('Shipped');
});

app.listen(3003, () => console.log('[ShippingService] Running on port 3003'));