import Boom from 'boom';
import Joi from 'joi';
import { restaurant as Restaurant } from '../../sequelize/models';

export default {
  method: 'GET',
  path: '/restaurants',
  config: {
    validate: {
      query: Joi.object().keys({
        id: Joi.string(),
        name: Joi.string(),
        preparationDelay: Joi.number(),
        rushDelay: Joi.number(),
      }),
    },
  },
  handler: async ({ query }, reply) => {
    try {
      const restaurants = await Restaurant.findAll({
        where: {
          ...query,
        },
      });
      return reply(restaurants);
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
