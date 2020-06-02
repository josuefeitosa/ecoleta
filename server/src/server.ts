import express from 'express';
import path from 'path';
import cors from 'cors';

import routes from './routes';

const app = express();

app.use(cors(/* Objeto com origins aqui */));
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

const port = 3334;
app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}!`);
});
