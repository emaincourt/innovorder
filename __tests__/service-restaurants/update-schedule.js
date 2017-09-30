import Joi from 'joi';
import Boom from 'boom';

beforeEach(() => {
  jest.resetModules();
});

describe('Payload validation', () => {
  it('accepts all the mandatory attributes to resize a schedule', () => {
    expect.assertions(1);
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').default;
    expect(
      Joi.validate(
        { from: 15, to: 30 },
        UpdateSchedule.config.validate.payload).error,
    ).toBeFalsy();
  });

  it('requires all the mandatory attributes to resize a schedule', () => {
    expect.assertions(2);
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').default;
    expect(
      Joi.validate(
        { from: 15 },
        UpdateSchedule.config.validate.payload).error,
    ).toBeTruthy();
    expect(
      Joi.validate(
        { to: 30 },
        UpdateSchedule.config.validate.payload).error,
    ).toBeTruthy();
  });

  it('requires the to attribute to be greater than from', () => {
    expect.assertions(1);
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').default;
    expect(
      Joi.validate(
        { to: 15, from: 30 },
        UpdateSchedule.config.validate.payload).error,
    ).toBeTruthy();
  });
});

describe('updateSchedule', () => {
  it('destroys a schedule if needed', async () => {
    expect.assertions(2);
    jest.mock('../../sequelize/models');
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').updateSchedule;
    const destroy = jest.fn();
    await expect(
      UpdateSchedule(
        { start: 15, end: 30, destroy },
        { from: 15, to: 30 },
      ),
    ).resolves.toEqual({});
    expect(destroy).toHaveBeenCalled();
  });

  it('reduces a schedule from start if needed', async () => {
    expect.assertions(3);
    jest.mock('../../sequelize/models');
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').updateSchedule;
    const update = jest.fn();
    const get = jest.fn(() => ({}));
    await expect(
      UpdateSchedule(
        { start: 15, end: 45, update, get },
        { from: 30, to: 45 },
      ),
    ).resolves.toEqual({});
    expect(update).toHaveBeenCalledWith({ start: 30 });
    expect(get).toHaveBeenCalled();
  });

  it('reduces a schedule from end if needed', async () => {
    expect.assertions(3);
    jest.mock('../../sequelize/models');
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').updateSchedule;
    const update = jest.fn();
    const get = jest.fn(() => ({}));
    await expect(
      UpdateSchedule(
        { start: 15, end: 45, update, get },
        { from: 15, to: 30 },
      ),
    ).resolves.toEqual({});
    expect(update).toHaveBeenCalledWith({ end: 30 });
    expect(get).toHaveBeenCalled();
  });

  it('splits the schedule into two separate ones if needed', async () => {
    expect.assertions(3);
    jest.mock('../../sequelize/models', () => ({
      schedule: {
        bulkCreate: (query) => {
          expect(query).toEqual([
            {
              scheduleSetId: 'any-scheduleset-id',
              start: 0,
              end: 15,
              day: 'MON',
            },
            {
              scheduleSetId: 'any-scheduleset-id',
              start: 30,
              end: 45,
              day: 'MON',
            },
          ]);
          return Promise.resolve([
            {
              get: () => ({
                id: 'any',
                day: 'MON',
                start: 0,
                end: 15,
              }),
            },
            {
              get: () => ({
                id: 'any',
                day: 'MON',
                start: 30,
                end: 45,
              }),
            },
          ]);
        },
      },
    }));
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').updateSchedule;
    const destroy = jest.fn();
    await expect(
      UpdateSchedule(
        { start: 0, end: 45, day: 'MON', scheduleSetId: 'any-scheduleset-id', destroy },
        { from: 15, to: 30 },
      ),
    ).resolves.toEqual([
      {
        id: 'any',
        day: 'MON',
        start: 0,
        end: 15,
      },
      {
        id: 'any',
        day: 'MON',
        start: 30,
        end: 45,
      },
    ]);
    expect(destroy).toHaveBeenCalledWith();
  });
});
