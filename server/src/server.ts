import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello, NLW2!' });
});

app.listen(3333);
