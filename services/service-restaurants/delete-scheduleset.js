import Boom from 'boom';
import {
  scheduleSet as ScheduleSet,
  schedule as Schedule,
} from '../../sequelize/models';

export default {
  method: 'DELETE',
  path: '/restaurants/{restaurantId}/schedule-sets/{scheduleSetId}',
  handler: async ({ params }, reply) => {
    try {
      const scheduleSet = await ScheduleSet.findById(params.scheduleSetId);
      const schedules = await Schedule.findAll({ where: { scheduleSetId: params.scheduleSetId } });
      for (const schedule of schedules) { // eslint-disable-line
        await schedule.destroy(); // eslint-disable-line
      }
      await scheduleSet.destroy();
      return reply({});
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
