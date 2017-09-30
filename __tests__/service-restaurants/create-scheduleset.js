import Joi from 'joi';
import Boom from 'boom';

beforeEach(() => {
  jest.resetModules();
});

describe('Payload validation', () => {
  it('validates a consistent payload', () => {
    const CreateScheduleSet = require('../../services/service-restaurants/create-scheduleset').default;
    expect.assertions(1);
    expect(
      Joi.validate({
        schedules: [{
          day: 'MON',
          start: 10,
          end: 20,
        }],
      }, CreateScheduleSet.config.validate.payload).error,
    ).toBeFalsy();
  });

  it('doesn\'t validate a payload with at least one missing key', () => {
    const CreateScheduleSet = require('../../services/service-restaurants/create-scheduleset').default;
    expect.assertions(3);
    expect(
      Joi.validate({
        schedules: [{
          day: 'MON',
          start: 10,
        }],
      }, CreateScheduleSet.config.validate.payload).error,
    ).toBeTruthy();
    expect(
      Joi.validate({
        schedules: [{
          day: 'MON',
          end: 20,
        }],
      }, CreateScheduleSet.config.validate.payload).error,
    ).toBeTruthy();
    expect(
      Joi.validate({
        schedules: [{
          start: 10,
          end: 20,
        }],
      }, CreateScheduleSet.config.validate.payload).error,
    ).toBeTruthy();
  });

  it('validates an empty payload', () => {
    const CreateScheduleSet = require('../../services/service-restaurants/create-scheduleset').default;
    expect.assertions(1);
    expect(
      Joi.validate({}, CreateScheduleSet.config.validate.payload).error,
    ).toBeFalsy();
  });

  it('doesn\'t validate a schedule with an invalid day', () => {
    const CreateScheduleSet = require('../../services/service-restaurants/create-scheduleset').default;
    expect.assertions(1);
    expect(
      Joi.validate({
        schedules: [{
          day: 'ABC',
          start: 10,
          end: 20,
        }],
      }, CreateScheduleSet.config.validate.payload).error,
    ).toBeTruthy();
  });
});

describe('Handler', () => {
  it('creates a restaurant if timing conditions are satisfied', async () => {
    expect.assertions(5);
    jest.mock('../../sequelize/models', () => ({
      restaurant: {
        findById: (params) => {
          expect(params).toEqual('any-restaurant-id');
          return Promise.resolve({
            update: scheduleSetId => expect(scheduleSetId).toEqual({ scheduleSetId: 'any-scheduleset-id' }),
          });
        },
      },
      scheduleSet: {
        create: () => Promise.resolve({
          id: 'any-scheduleset-id',
        }),
      },
      schedule: {
        bulkCreate: (items) => {
          expect(items).toEqual([{
            day: 'MON',
            start: 15,
            end: 30,
            scheduleSetId: 'any-scheduleset-id',
          }]);
          return Promise.resolve([{ get: () => ({
            day: 'MON',
            start: 15,
            end: 30,
            scheduleSetId: 'any-scheduleset-id',
          }) }]);
        },
      },
    }));
    const CreateScheduleSet = require('../../services/service-restaurants/create-scheduleset').default;
    await expect(
      CreateScheduleSet.handler({
        payload: {
          schedules: [{
            day: 'MON',
            start: 15,
            end: 30,
          }],
        },
        params: { restaurantId: 'any-restaurant-id' },
      }, (inserted) => {
        expect(inserted).toEqual({
          id: 'any-scheduleset-id',
          schedules: [{
            day: 'MON',
            start: 15,
            end: 30,
            scheduleSetId: 'any-scheduleset-id',
          }],
        });
      }),
    ).resolves.toMatchSnapshot();
  });

  it('doesn\'t allow start and end time that are not multiplicators of 15', async () => {
    expect.assertions(5);
    jest.mock('../../sequelize/models', () => ({
      restaurant: {
        findById: (params) => {
          expect(params).toEqual('any-restaurant-id');
          return Promise.resolve({
            update: scheduleSetId => expect(scheduleSetId).toEqual({ scheduleSetId: 'any-scheduleset-id' }),
          });
        },
      },
      scheduleSet: {
        create: () => Promise.resolve({
          id: 'any-scheduleset-id',
        }),
      },
      schedule: {
        bulkCreate: (items) => {
          expect(items).toEqual([]);
          return Promise.resolve([]);
        },
      },
    }));
    const CreateScheduleSet = require('../../services/service-restaurants/create-scheduleset').default;
    await expect(
      CreateScheduleSet.handler({
        payload: {
          schedules: [{
            day: 'MON',
            start: 10,
            end: 20,
          }],
        },
        params: { restaurantId: 'any-restaurant-id' },
      }, (inserted) => {
        expect(inserted).toEqual({
          id: 'any-scheduleset-id',
          schedules: [],
        });
      }),
    ).resolves.toMatchSnapshot();
  });

  it('doesn\'t allow a minus start value', async () => {
    expect.assertions(5);
    jest.mock('../../sequelize/models', () => ({
      restaurant: {
        findById: (params) => {
          expect(params).toEqual('any-restaurant-id');
          return Promise.resolve({
            update: scheduleSetId => expect(scheduleSetId).toEqual({ scheduleSetId: 'any-scheduleset-id' }),
          });
        },
      },
      scheduleSet: {
        create: () => Promise.resolve({
          id: 'any-scheduleset-id',
        }),
      },
      schedule: {
        bulkCreate: (items) => {
          expect(items).toEqual([{
            day: 'MON',
            start: 0,
            end: 30,
            scheduleSetId: 'any-scheduleset-id',
          }]);
          return Promise.resolve([{ get: () => ({
            day: 'MON',
            start: 0,
            end: 30,
            scheduleSetId: 'any-scheduleset-id',
          }) }]);
        },
      },
    }));
    const CreateScheduleSet = require('../../services/service-restaurants/create-scheduleset').default;
    await expect(
      CreateScheduleSet.handler({
        payload: {
          schedules: [{
            day: 'MON',
            start: -15,
            end: 30,
          }],
        },
        params: { restaurantId: 'any-restaurant-id' },
      }, (inserted) => {
        expect(inserted).toEqual({
          id: 'any-scheduleset-id',
          schedules: [{
            day: 'MON',
            start: 0,
            end: 30,
            scheduleSetId: 'any-scheduleset-id',
          }],
        });
      }),
    ).resolves.toMatchSnapshot();
  });

  it('doesn\'t allow an end value that is over the duration of one entire day', async () => {
    expect.assertions(5);
    jest.mock('../../sequelize/models', () => ({
      restaurant: {
        findById: (params) => {
          expect(params).toEqual('any-restaurant-id');
          return Promise.resolve({
            update: scheduleSetId => expect(scheduleSetId).toEqual({ scheduleSetId: 'any-scheduleset-id' }),
          });
        },
      },
      scheduleSet: {
        create: () => Promise.resolve({
          id: 'any-scheduleset-id',
        }),
      },
      schedule: {
        bulkCreate: (items) => {
          expect(items).toEqual([{
            day: 'MON',
            start: 15,
            end: 1440,
            scheduleSetId: 'any-scheduleset-id',
          }]);
          return Promise.resolve([{ get: () => ({
            day: 'MON',
            start: 15,
            end: 1440,
            scheduleSetId: 'any-scheduleset-id',
          }) }]);
        },
      },
    }));
    const CreateScheduleSet = require('../../services/service-restaurants/create-scheduleset').default;
    await expect(
      CreateScheduleSet.handler({
        payload: {
          schedules: [{
            day: 'MON',
            start: 15,
            end: 1450,
          }],
        },
        params: { restaurantId: 'any-restaurant-id' },
      }, (inserted) => {
        expect(inserted).toEqual({
          id: 'any-scheduleset-id',
          schedules: [{
            day: 'MON',
            start: 15,
            end: 1440,
            scheduleSetId: 'any-scheduleset-id',
          }],
        });
      }),
    ).resolves.toMatchSnapshot();
  });
});
