import Joi from 'joi';
import Boom from 'boom';
import {
  schedule as Schedule,
} from '../../sequelize/models';

export async function updateSchedule(schedule, interval) {
  if (interval.from === schedule.start && interval.to === schedule.end) {
    await schedule.destroy();
    return {};
  } else if (interval.from === schedule.start) {
    await schedule.update({ end: interval.to });
    return schedule.get();
  } else if (interval.to === schedule.end) {
    await schedule.update({ start: interval.from });
    return schedule.get();
  }
  const schedules = await Schedule.bulkCreate([
    {
      scheduleSetId: schedule.scheduleSetId,
      start: schedule.start,
      end: interval.from,
      day: schedule.day,
    },
    {
      scheduleSetId: schedule.scheduleSetId,
      start: interval.to,
      end: schedule.end,
      day: schedule.day,
    },
  ]);
  await schedule.destroy();
  return schedules.map(element => element.get());
}

export default {
  method: 'PATCH',
  path: '/restaurants/{restaurantId}/schedule-sets/{scheduleSetId}/schedules/{scheduleId}',
  config: {
    validate: {
      payload: Joi.object().keys({
        from: Joi.number().less(Joi.ref('to')).required(),
        to: Joi.number().greater(Joi.ref('from')).required(),
      }),
    },
  },
  handler: async ({ params, payload }, reply) => {
    try {
      if (payload.from % 15 !== 0 || payload.to % 15 !== 0) {
        throw Boom.badData('Intervals must be multiplicators of 15.');
      }
      const schedule = await Schedule.findById(params.scheduleId);
      return reply(
        await updateSchedule(schedule, payload),
      );
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
