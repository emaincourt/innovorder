import Joi from 'joi';
import Boom from 'boom';
import { restaurant as Restaurant } from '../../sequelize/models';

export default {
  method: 'POST',
  path: '/restaurants',
  config: {
    validate: {
      payload: Joi.object().keys({
        name: Joi.string().required(),
        preparationDelay: Joi.number().required(),
        rushDelay: Joi.number().required(),
      }).required(),
    },
  },
  handler: async ({ payload }, reply) => {
    try {
      const inserted = await Restaurant.create({
        ...payload,
      });
      return reply(inserted);
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
