const express = require('express');
const app = express();
app.use(express.json());

let stock = { item123: 10 };

app.post('/reserve', (req, res) => {
  const { productId } = req.body;
  if (stock[productId] > 0) {
    stock[productId]--;
    console.log(`[InventoryService] Reserved stock for ${productId}`);
    res.send('Reserved');
  } else {
    console.log(`[InventoryService] Out of stock for ${productId}`);
    res.status(400).send('Out of stock');
  }
});

app.post('/release', (req, res) => {
  const { productId } = req.body;
  stock[productId]++;
  console.log(`[InventoryService] Released stock for ${productId}`);
  res.send('Released');
});

app.listen(3001, () => console.log('[InventoryService] Running on port 3001'));