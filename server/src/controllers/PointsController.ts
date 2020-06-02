import { Request, Response } from 'express';
import knex from '../database/connection';

export default class PointsController {
  public async index(request: Request, response: Response) {
    try {
      const { city, uf, items } = request.query;

      const parsedItems = String(items)
        .split(',')
        .map((item) => Number(item.trim()));

      console.log(String(items).split(','));
      console.log(parsedItems);

      const points = await knex('points')
        .join('point_items', 'points.id', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where({
          'points.city': String(city),
          'points.uf': String(uf),
        })
        .distinct()
        .select('points.*');

      return response.status(200).json(points);
    } catch (error) {
      return response.status(400).json(error);
    }
  }

  public async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const point = {
      image:
        'https://www.supermercadosrondon.com.br/img/site/lojas/supermercados_rondon_loja_jussara.jpg',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const trx = await knex.transaction();
    try {
      const insertedIDs = await trx('points').insert(point).returning('id');

      const createdPointID = insertedIDs[0];

      const pointItems = items.map((itemID: number) => {
        return {
          item_id: itemID,
          point_id: createdPointID,
        };
      });

      await trx('point_items').insert(pointItems);

      await trx.commit();
      return response.status(201).json({ id: createdPointID, ...point, items });
    } catch (error) {
      await trx.rollback();
      return response.status(400).json({ success: false, error });
    }
  }

  public async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').select('*').where('id', id).first();

    if (!point)
      return response.status(400).json({ message: `Point ${id} not found!` });

    const items = await knex('items')
      .join('point_items', 'items.id', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.status(200).json({ point, items });
  }
}
