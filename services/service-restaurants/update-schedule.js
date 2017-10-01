import Joi from 'joi';
import Boom from 'boom';
import {
  schedule as Schedule,
} from '../../sequelize/models';

export default {
  method: 'PATCH',
  path: '/restaurants/{restaurantId}/schedule-sets/{scheduleSetId}/schedules/{scheduleId}',
  config: {
    validate: {
      payload: Joi.object().keys({
        start: Joi.number().less(Joi.ref('end')).required(),
        end: Joi.number().greater(Joi.ref('start')).required(),
      }),
    },
  },
  handler: async ({ params, payload }, reply) => {
    try {
      if (payload.start % 15 !== 0 || payload.end % 15 !== 0) {
        throw Boom.badData('Intervals must be multiplicators of 15.');
      }
      const schedule = await Schedule.findById(params.scheduleId);
      return reply(
        await schedule.update({ start: payload.start, end: payload.end }),
      );
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
