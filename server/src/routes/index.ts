import express from 'express';
import itemRoutes from './items.routes';
import pointRoutes from './points.routes';

const routes = express.Router();

routes.get('/', (request, response) => {
  response.json({ message: 'Hello, NLW2!' });
});

routes.use(itemRoutes);
routes.use(pointRoutes);

export default routes;
