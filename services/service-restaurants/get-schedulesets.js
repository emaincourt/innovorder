import Joi from 'joi';
import Boom from 'boom';
import { omit } from 'lodash';
import {
  schedule as Schedule,
  scheduleSet as ScheduleSet,
} from '../../sequelize/models';

export default {
  method: 'GET',
  config: {
    validate: {
      query: {
        id: Joi.string(),
        days: Joi.alternatives().try(
          Joi.string(),
          Joi.array().items(
            Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'),
          ),
        ),
      },
    },
  },
  path: '/restaurants/{restaurantId}/schedule-sets',
  handler: async ({ query }, reply) => {
    try {
      const response = [];
      const scheduleSets = await ScheduleSet.findAll({
        where: omit(query, 'days'),
      });
      // For avoiding concurrency on readings since map is a higher order function
      for (const scheduleSet of scheduleSets) { // eslint-disable-line
        const schedules = await Schedule.findAll({ // eslint-disable-line
          where: { scheduleSetId: scheduleSet.get('id') },
        });
        response.push({
          ...scheduleSet.get(),
          schedules: schedules
            .map(schedule => schedule.get())
            .filter(schedule => (query.days ? query.days.includes(schedule.day) : true)),
        });
      }
      return reply(response);
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
