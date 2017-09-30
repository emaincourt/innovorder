import { Server } from 'hapi';

const server = new Server();

server.connection({
  port: 3000,
  host: 'localhost',
});

server.route([
]);

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
