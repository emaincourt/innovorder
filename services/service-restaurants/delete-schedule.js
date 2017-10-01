import Boom from 'boom';
import {
  schedule as Schedule,
} from '../../sequelize/models';

export default {
  method: 'DELETE',
  path: '/restaurants/{restaurantId}/schedule-sets/{scheduleSetId}/schedules/{scheduleId}',
  handler: async ({ params }, reply) => {
    try {
      const schedule = await Schedule.findById(params.scheduleId);
      await schedule.destroy();
      return reply({});
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  },
};
