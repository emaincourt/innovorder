import { Server } from 'hapi';
import getRestaurants from './services/service-restaurants/get-restaurants';
import createRestaurant from './services/service-restaurants/create-restaurant';
import getScheduleSets from './services/service-restaurants/get-schedulesets';
import createScheduleSet from './services/service-restaurants/create-scheduleset';
import updateScheduleSet from './services/service-restaurants/update-scheduleset';
import deleteScheduleSet from './services/service-restaurants/delete-scheduleset';

const server = new Server();

server.connection({
  port: 3000,
  host: 'localhost',
});

server.route([
  getRestaurants,
  createRestaurant,
  createScheduleSet,
  getScheduleSets,
  updateScheduleSet,
  deleteScheduleSet,
]);

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
