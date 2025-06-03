const express = require('express');
const app = express();
app.use(express.json());

let balance = { user123: 0 };

app.post('/charge', (req, res) => {
  const { userId } = req.body;
  if (balance[userId] >= 100) {
    balance[userId] -= 100;
    console.log(`[PaymentService] Charged ${userId}`);
    res.send('Charged');
  } else {
    console.log(`[PaymentService] Insufficient funds for ${userId}`);
    res.status(400).send('Insufficient funds');
  }
});

app.post('/refund', (req, res) => {
  const { userId } = req.body;
  balance[userId] += 100;
  console.log(`[PaymentService] Refunded ${userId}`);
  res.send('Refunded');
});

app.listen(3002, () => console.log('[PaymentService] Running on port 3002'));