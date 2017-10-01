import Joi from 'joi';
import Boom from 'boom';
import {
  schedule as Schedule,
} from '../../sequelize/models';

export async function createSchedule(schedules, newSchedule) {
  const contiguous = schedules
    .filter(
      schedule => schedule.day === newSchedule.day
      && (
        schedule.end <= newSchedule.start
        || schedule.start >= newSchedule.end
        || schedule.end === newSchedule.end
        || schedule.start === newSchedule.start
      ),
    );
  const params = {
    ...newSchedule,
    day: newSchedule.day,
    start: contiguous.length ?
      Math.min(...contiguous.map(schedule => schedule.start), newSchedule.start)
      : newSchedule.start,
    end: contiguous.length ?
      Math.max(...contiguous.map(schedule => schedule.end), newSchedule.end)
      : newSchedule.end,
  };
  for (const outdated of contiguous) { // eslint-disable-line
    await outdated.destroy(); // eslint-disable-line
  }
  return Schedule.create(params);
}

export default {
  method: 'PATCH',
  path: '/restaurants/{restaurantId}/schedule-sets/{scheduleSetId}',
  config: {
    validate: {
      payload: {
        schedules: Joi.array().items(
          Joi.object().keys({
            day: Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN').required(),
            start: Joi.number().required(),
            end: Joi.number().required(),
          }).required(),
        ),
      },
    },
  },
  handler: async ({ params, payload }, reply) => {
    try {
      const schedules = await Schedule.findAll({
        where: {
          scheduleSetId: params.scheduleSetId,
        },
      });
      const pending = payload.schedules
        .map(schedule => (schedule.start >= 0 ? schedule : { ...schedule, start: 0 }))
        .map(schedule => (schedule.end <= 1440 ? schedule : { ...schedule, end: 1440 }))
        .filter(schedule => schedule.start % 15 === 0 && schedule.end % 15 === 0)
        .filter(schedule => schedule.start < schedule.end)
        .map(schedule => ({ ...schedule, scheduleSetId: params.scheduleSetId }));
      const inserted = [];
      for (let element of pending) { // eslint-disable-line
        inserted.push(
          await createSchedule(schedules, element), // eslint-disable-line
        );
      }
      return reply({
        id: params.scheduleSetId,
        schedules: inserted.map(schedule => schedule.get()),
      });
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
