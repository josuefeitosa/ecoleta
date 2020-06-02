import express from 'express';

import ItemsController from '../controllers/ItemsController';

const routes = express();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);

export default routes;
