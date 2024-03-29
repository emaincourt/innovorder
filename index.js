import { Server } from 'hapi';
import getRestaurants from './services/service-restaurants/get-restaurants';
import createRestaurant from './services/service-restaurants/create-restaurant';
import getScheduleSets from './services/service-restaurants/get-schedulesets';
import createScheduleSet from './services/service-restaurants/create-scheduleset';
import updateScheduleSet from './services/service-restaurants/update-scheduleset';
import deleteScheduleSet from './services/service-restaurants/delete-scheduleset';
import updateSchedule from './services/service-restaurants/update-schedule';
import deleteSchedule from './services/service-restaurants/delete-schedule';

const server = new Server();

server.connection({
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
  routes: { cors: true },
});

server.route([
  getRestaurants,
  createRestaurant,
  createScheduleSet,
  getScheduleSets,
  updateScheduleSet,
  deleteScheduleSet,
  updateSchedule,
  deleteSchedule,
]);

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
