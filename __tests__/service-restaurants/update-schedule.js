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
        { start: 15, end: 30 },
        UpdateSchedule.config.validate.payload).error,
    ).toBeFalsy();
  });

  it('requires all the mandatory attributes to resize a schedule', () => {
    expect.assertions(2);
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').default;
    expect(
      Joi.validate(
        { start: 15 },
        UpdateSchedule.config.validate.payload).error,
    ).toBeTruthy();
    expect(
      Joi.validate(
        { end: 30 },
        UpdateSchedule.config.validate.payload).error,
    ).toBeTruthy();
  });

  it('requires the to attribute to be greater than from', () => {
    expect.assertions(1);
    const UpdateSchedule = require('../../services/service-restaurants/update-schedule').default;
    expect(
      Joi.validate(
        { end: 15, start: 30 },
        UpdateSchedule.config.validate.payload).error,
    ).toBeTruthy();
  });
});
