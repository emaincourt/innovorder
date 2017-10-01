import Boom from 'boom';
import Joi from 'joi';

beforeEach(() => {
  jest.resetModules();
});

describe('Payload validation', () => {
  it('accepts all the attributes of a new schedule as payload data', () => {
    expect.assertions(1);
    const UpdateScheduleSet = require('../../services/service-restaurants/update-scheduleset').default;
    expect(
      Joi.validate({
        schedules: [
          { day: 'MON', start: 15, end: 30 },
        ],
      }, UpdateScheduleSet.config.validate.payload).error,
    ).toBeFalsy();
  });

  it('requires all the attributes of a new schedule as a payload data', () => {
    expect.assertions(3);
    const UpdateScheduleSet = require('../../services/service-restaurants/update-scheduleset').default;
    expect(
      Joi.validate({
        schedules: [
          { start: 15, end: 30 },
        ],
      }, UpdateScheduleSet.config.validate.payload).error,
    ).toBeTruthy();
    expect(
      Joi.validate({
        schedules: [
          { day: 'MON', end: 30 },
        ],
      }, UpdateScheduleSet.config.validate.payload).error,
    ).toBeTruthy();
    expect(
      Joi.validate({
        schedules: [
          { day: 'MON', start: 15 },
        ],
      }, UpdateScheduleSet.config.validate.payload).error,
    ).toBeTruthy();
  });
});

describe('createSchedule', () => {
  it('is able to detect contiguous schedules and to merge them', async () => {
    expect.assertions(5);
    jest.mock('../../sequelize/models', () => ({
      schedule: {
        create: (params) => {
          expect(params).toEqual({
            day: 'MON',
            start: 15,
            end: 45,
          });
          return Promise.resolve({
            day: 'MON',
            start: 15,
            end: 45,
          });
        },
      },
    }));
    const createSchedule = require('../../services/service-restaurants/update-scheduleset').createSchedule;
    const schedules = [
      { day: 'MON', start: 15, end: 30, destroy: jest.fn() },
      { day: 'MON', start: 30, end: 45, destroy: jest.fn() },
      { day: 'SAT', start: 30, end: 45, destroy: jest.fn() },
    ];
    const newSchedule = { day: 'MON', start: 30, end: 45 };
    await expect(
      createSchedule(schedules, newSchedule),
    ).resolves.toEqual({
      day: 'MON',
      start: 15,
      end: 45,
    });
    expect(schedules[0].destroy).toHaveBeenCalled();
    expect(schedules[1].destroy).toHaveBeenCalled();
    expect(schedules[2].destroy).not.toHaveBeenCalled();
  });

  it('is able to detect contiguous and duplicated schedules and to merge them', async () => {
    expect.assertions(5);
    jest.mock('../../sequelize/models', () => ({
      schedule: {
        create: (params) => {
          expect(params).toEqual({
            day: 'MON',
            start: 15,
            end: 45,
          });
          return Promise.resolve({
            day: 'MON',
            start: 15,
            end: 45,
          });
        },
      },
    }));
    const createSchedule = require('../../services/service-restaurants/update-scheduleset').createSchedule;
    const schedules = [
      { day: 'MON', start: 15, end: 30, destroy: jest.fn() },
      { day: 'MON', start: 30, end: 45, destroy: jest.fn() },
      { day: 'MON', start: 15, end: 30, destroy: jest.fn() },
    ];
    const newSchedule = { day: 'MON', start: 30, end: 45 };
    await expect(
      createSchedule(schedules, newSchedule),
    ).resolves.toEqual({
      day: 'MON',
      start: 15,
      end: 45,
    });
    expect(schedules[0].destroy).toHaveBeenCalled();
    expect(schedules[1].destroy).toHaveBeenCalled();
    expect(schedules[2].destroy).toHaveBeenCalled();
  });

  it('does not merge uncontiguous items', async () => {
    expect.assertions(3);
    jest.mock('../../sequelize/models', () => ({
      schedule: {
        create: (params) => {
          expect(params).toEqual({
            day: 'MON',
            start: 40,
            end: 70,
          });
          return Promise.resolve({
            day: 'MON',
            start: 40,
            end: 70,
          });
        },
      },
    }));
    const createSchedule = require('../../services/service-restaurants/update-scheduleset').createSchedule;
    const schedules = [
      { day: 'MON', start: 15, end: 30, destroy: jest.fn() },
      { day: 'MON', start: 80, end: 100, destroy: jest.fn() },
    ];
    const newSchedule = { day: 'MON', start: 40, end: 70 };
    await expect(
      createSchedule(schedules, newSchedule),
    ).resolves.toEqual({
      day: 'MON',
      start: 40,
      end: 70,
    });
    expect(schedules[0].destroy).not.toHaveBeenCalled();
  });
});

describe('Handler', () => {
  it('creates the right amount of schedules according to the payload', async () => {
    expect.assertions(4);
    jest.mock('../../sequelize/models', () => ({
      schedule: {
        findAll: (params) => {
          expect(params).toEqual({
            where: { scheduleSetId: 'any-scheduleset-id' },
          });
          return [];
        },
        create: (params) => {
          expect(params).toEqual({
            day: 'MON',
            start: 15,
            end: 30,
            scheduleSetId: 'any-scheduleset-id',
          });
          return Promise.resolve({
            get: () => ({
              day: 'MON',
              start: 15,
              end: 30,
              scheduleSetId: 'any-scheduleset-id',
            }),
          });
        },
      },
    }));
    const UpdateScheduleSet = require('../../services/service-restaurants/update-scheduleset').default;
    await expect(
      UpdateScheduleSet.handler({
        payload: {
          schedules: [{ day: 'MON', start: 15, end: 30 }],
        },
        params: { scheduleSetId: 'any-scheduleset-id' },
      }, response => expect(response).toEqual({
        id: 'any-scheduleset-id',
        schedules: [
          { day: 'MON', start: 15, end: 30, scheduleSetId: 'any-scheduleset-id' },
        ],
      })),
    ).resolves.toMatchSnapshot();
  });
});
