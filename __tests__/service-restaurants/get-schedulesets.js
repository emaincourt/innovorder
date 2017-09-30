import Boom from 'boom';
import Joi from 'joi';

beforeEach(() => {
  jest.resetModules();
});

describe('Query validation', () => {
  it('accepts all the query parameters that match the properties of a scheduleset with a range of days also', () => {
    const GetScheduleSets = require('../../services/service-restaurants/get-schedulesets').default;
    expect.assertions(1);
    expect(
      Joi.validate({
        id: 'any-id',
        days: 'MON',
      }, GetScheduleSets.config.validate.query).error,
    ).toBeFalsy();
  });

  it('accepts both a string and an array as a day query parameter', () => {
    const GetScheduleSets = require('../../services/service-restaurants/get-schedulesets').default;
    expect.assertions(1);
    expect(
      Joi.validate({
        id: 'any-id',
        days: ['MON', 'TUE'],
      }, GetScheduleSets.config.validate.query).error,
    ).toBeFalsy();
  });

  it('doesn\'t accept an invalid day as a query parameter', () => {
    const GetScheduleSets = require('../../services/service-restaurants/get-schedulesets').default;
    expect.assertions(1);
    expect(
      Joi.validate({
        id: 'any-id',
        days: ['MON', 'ABC'],
      }, GetScheduleSets.config.validate.query).error,
    ).toBeTruthy();
  });
});

describe('Handler', () => {
  it('finds all the scheduleSets that match the query parameters and the according schedules', async () => {
    expect.assertions(4);
    jest.mock('../../sequelize/models', () => ({
      scheduleSet: {
        findAll: (query) => {
          expect(query).toEqual({ where: { id: 'any-id' } });
          const scheduleSet = { id: 'any-id' };
          return Promise.resolve([{
            get: field => (field ? scheduleSet[field] : scheduleSet),
          }]);
        },
      },
      schedule: {
        findAll: (query) => {
          expect(query).toEqual({ where: { scheduleSetId: 'any-id' } });
          return Promise.resolve([{
            get: () => ({
              id: 'any',
              day: 'MON',
              start: 15,
              end: 30,
            }),
          }]);
        },
      },
    }));
    const GetScheduleSets = require('../../services/service-restaurants/get-schedulesets').default;
    await expect(
      GetScheduleSets.handler({
        query: {
          id: 'any-id',
          days: ['MON', 'TUE'],
        },
      }, (response) => {
        expect(response).toEqual([{
          id: 'any-id',
          schedules: [{
            id: 'any',
            day: 'MON',
            start: 15,
            end: 30,
          }],
        }]);
      }),
    ).resolves.toMatchSnapshot();
  });

  it('filters the schedules according to the query parameters', async () => {
    expect.assertions(4);
    jest.mock('../../sequelize/models', () => ({
      scheduleSet: {
        findAll: (query) => {
          expect(query).toEqual({ where: { id: 'any-id' } });
          const scheduleSet = { id: 'any-id' };
          return Promise.resolve([{
            get: field => (field ? scheduleSet[field] : scheduleSet),
          }]);
        },
      },
      schedule: {
        findAll: (query) => {
          expect(query).toEqual({ where: { scheduleSetId: 'any-id' } });
          return Promise.resolve([{
            get: () => ({
              id: 'any',
              day: 'MON',
              start: 15,
              end: 30,
            }),
          }]);
        },
      },
    }));
    const GetScheduleSets = require('../../services/service-restaurants/get-schedulesets').default;
    await expect(
      GetScheduleSets.handler({
        query: {
          id: 'any-id',
          days: ['TUE', 'WED'],
        },
      }, (response) => {
        expect(response).toEqual([{
          id: 'any-id',
          schedules: [],
        }]);
      }),
    ).resolves.toMatchSnapshot();
  });

  it('forwards the error if one gets thrown during the deletion', async () => {
    expect.assertions(4);
    jest.mock('../../sequelize/models', () => ({
      scheduleSet: {
        findAll: (query) => {
          expect(query).toEqual({ where: { id: 'any-id' } });
          const scheduleSet = { id: 'any-id' };
          return Promise.resolve([{
            get: field => (field ? scheduleSet[field] : scheduleSet),
          }]);
        },
      },
      schedule: {
        findAll: (query) => {
          expect(query).toEqual({ where: { scheduleSetId: 'any-id' } });
          return Promise.reject(new Error());
        },
      },
    }));
    const GetScheduleSets = require('../../services/service-restaurants/get-schedulesets').default;
    await expect(
      GetScheduleSets.handler({
        query: {
          id: 'any-id',
          days: ['TUE', 'WED'],
        },
      }, (response) => {
        expect(response).toEqual(Boom.wrap(new Error()));
      }),
    ).resolves.toMatchSnapshot();
  });
});
