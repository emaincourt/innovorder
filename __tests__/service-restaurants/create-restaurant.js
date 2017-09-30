import Joi from 'joi';
import Boom from 'boom';

beforeEach(() => {
  jest.resetModules();
});

describe('Payload validation', () => {
  it('validates a consistent payload', () => {
    const CreateRestaurant = require('../../services/service-restaurants/create-restaurant').default;
    expect.assertions(1);
    expect(
      Joi.validate({
        name: 'Any Name',
        rushDelay: 15,
        preparationDelay: 15,
      }, CreateRestaurant.config.validate.payload).error,
    ).toBeFalsy();
  });

  it('doesn\'t validate a payload with at least one missing key', () => {
    const CreateRestaurant = require('../../services/service-restaurants/create-restaurant').default;
    expect.assertions(3);
    expect(
      Joi.validate({
        name: 'Any Name',
        rushDelay: 15,
      }, CreateRestaurant.config.validate.payload).error,
    ).toBeTruthy();
    expect(
      Joi.validate({
        name: 'Any Name',
        preparationDelay: 15,
      }, CreateRestaurant.config.validate.payload).error,
    ).toBeTruthy();
    expect(
      Joi.validate({
        rushDelay: 15,
        preparationDelay: 15,
      }, CreateRestaurant.config.validate.payload).error,
    ).toBeTruthy();
  });

  it('doesn\'t validate an empty payload', () => {
    const CreateRestaurant = require('../../services/service-restaurants/create-restaurant').default;
    expect.assertions(1);
    expect(
      Joi.validate({}, CreateRestaurant.config.validate.payload).error,
    ).toBeTruthy();
  });
});

describe('Handler', () => {
  it('creates a restaurant if timing conditions are satisfied', async () => {
    expect.assertions(2);
    jest.mock('../../sequelize/models', () => ({
      restaurant: {
        create: params => Promise.resolve(params),
      },
    }));
    const CreateRestaurant = require('../../services/service-restaurants/create-restaurant').default;
    await expect(
      CreateRestaurant.handler({
        payload: {
          name: 'Any Name',
          rushDelay: 15,
          preparationDelay: 15,
        },
      }, (inserted) => {
        expect(inserted).toEqual({
          name: 'Any Name',
          rushDelay: 15,
          preparationDelay: 15,
        });
      }),
    ).resolves.toMatchSnapshot();
  });

  it('forwards the error if one gets thrown during the insertion', async () => {
    expect.assertions(2);
    jest.mock('../../sequelize/models', () => ({
      restaurant: {
        create: () => Promise.reject(new Error()),
      },
    }));
    const CreateRestaurant = require('../../services/service-restaurants/create-restaurant').default;
    await expect(
      CreateRestaurant.handler({
        payload: {
          name: 'Any Name',
          rushDelay: 15,
          preparationDelay: 15,
        },
      }, (error) => {
        expect(error).toMatchSnapshot();
      }),
    ).resolves.toMatchSnapshot();
  });
});
