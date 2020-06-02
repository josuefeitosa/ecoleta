import express from 'express';

import PointsController from '../controllers/PointsController';

const routes = express();
const pointsController = new PointsController();

routes.get('/points', pointsController.index);
routes.post('/points', pointsController.create);
routes.get('/points/:id', pointsController.show);

export default routes;
