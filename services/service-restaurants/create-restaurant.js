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
      if (
        payload.preparationDelay % 15 !== 0
        || payload.rushDelay % 15 !== 0
      ) {
        return reply(
          Boom.badData('Preparation and rush delays must be multiplicators of 15.'),
        ).code(422);
      }
      const inserted = await Restaurant.create({
        ...payload,
      });
      return reply(inserted);
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
