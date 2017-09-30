import Joi from 'joi';
import Boom from 'boom';
import {
  restaurant as Restaurant,
  scheduleSet as ScheduleSet,
  schedule as Schedule,
} from '../../sequelize/models';

export default {
  method: 'POST',
  path: '/restaurants/{restaurantId}/schedule-sets',
  config: {
    validate: {
      payload: {
        schedules: Joi.array().items(
          Joi.object().keys({
            day: Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN').required(),
            start: Joi.number().required(),
            end: Joi.number().required(),
          }),
        ),
      },
    },
  },
  handler: async ({ params, payload }, reply) => {
    try {
      const restaurant = await Restaurant.findById(params.restaurantId);
      const inserted = await ScheduleSet.create();
      await restaurant.update({
        scheduleSetId: inserted.id,
      });
      const schedules = await Schedule.bulkCreate(
        payload.schedules
          .map(schedule => (schedule.start >= 0 ? schedule : { ...schedule, start: 0 }))
          .map(schedule => (schedule.end <= 1440 ? schedule : { ...schedule, end: 1440 }))
          .filter(schedule => schedule.start % 15 === 0 && schedule.end % 15 === 0)
          .filter(schedule => schedule.start < schedule.end)
          .map(schedule => ({ ...schedule, scheduleSetId: inserted.id })),
      );
      return reply({
        id: inserted.id,
        schedules: schedules.map(schedule => schedule.get()),
      });
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
