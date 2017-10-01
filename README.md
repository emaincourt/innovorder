### Installation and starting

#### Dependencies

Run `yarn` at the root of the project folder. You also need to globally install angular to be able to run the server.

```bash
yarn && yarn add global @angular/cli
```

### Back-end

#### Structure

If only a few of them are really in use, the following routes are available :

> GET /restaurants
> POST /restaurants
> GET /restaurants/:id/schedule-sets
> POST /restaurants/:id/schedule-sets
> PATCH /restaurants/:id/schedule-sets/:id
> DELETE /restaurants/:id/schedule-sets/:id
> PATCH /restaurants/:id/schedule-sets/:id/schedules/:id
> DELETE /restaurants/:id/schedule-sets/:id/schedules/:id

You'll find the code in :
- `/services` for the handlers
- `/__tests__` for the tests
- `/sequelize` for the migrations and the models

#### Scripts

Run `yarn start` for starting the Hapi server or `yarn test` to run the tests.

### Front-end

Definitely not my cup of tee...

#### Run

To start the Angular server, run the following command from the root of the project :

```bash
cd innovorder && yarn && ng serve
```

It might take a while to bundle and optimize the assets of the project. You can then reach the [local url](http://localhost:4200/).

#### Functionnalities

The functionnalities of the project are the same as described in your paper. You can also set new preparation and rush delays for testing purpose. These values will not be saved for later use.