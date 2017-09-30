import Boom from 'boom';
import Joi from 'joi';

beforeEach(() => {
  jest.resetModules();
});

describe('Query validation', () => {
  it('accepts all the query parameters that match the properties of a restaurant', () => {
    const GetRestaurants = require('../../services/service-restaurants/get-restaurants').default;
    expect.assertions(1);
    expect(
      Joi.validate({
        id: 'any-id',
        name: 'any-name',
        preparationDelay: 20,
        rushDelay: 20,
      }, GetRestaurants.config.validate.query).error,
    ).toBeFalsy();
  });
});

describe('Handler', () => {
  it('finds all the restaurants that match the query parameters', async () => {
    expect.assertions(3);
    jest.mock('../../sequelize/models', () => ({
      restaurant: {
        findAll: (query) => {
          expect(query).toEqual({ where: {
            id: 'any-id',
            name: 'any-name',
            preparationDelay: 20,
            rushDelay: 20,
          } });
          return Promise.resolve([{
            id: 'any-id',
            name: 'any-name',
            preparationDelay: 20,
            rushDelay: 20,
          }]);
        },
      },
    }));
    const GetRestaurants = require('../../services/service-restaurants/get-restaurants').default;
    await expect(
      GetRestaurants.handler({
        query: {
          id: 'any-id',
          name: 'any-name',
          preparationDelay: 20,
          rushDelay: 20,
        },
      }, (response) => {
        expect(response).toEqual([{
          id: 'any-id',
          name: 'any-name',
          preparationDelay: 20,
          rushDelay: 20,
        }]);
      }),
    ).resolves.toMatchSnapshot();
  });

  it('forwards the error if one gets thrown during the deletion', async () => {
    expect.assertions(3);
    jest.mock('../../sequelize/models', () => ({
      restaurant: {
        findAll: (query) => {
          expect(query).toEqual({ where: {
            id: 'any-id',
            name: 'any-name',
            preparationDelay: 20,
            rushDelay: 20,
          } });
          return Promise.reject(new Error());
        },
      },
    }));
    const GetRestaurants = require('../../services/service-restaurants/get-restaurants').default;
    await expect(
      GetRestaurants.handler({
        query: {
          id: 'any-id',
          name: 'any-name',
          preparationDelay: 20,
          rushDelay: 20,
        },
      }, (response) => {
        expect(response).toEqual(Boom.wrap(new Error()));
      }),
    ).resolves.toMatchSnapshot();
  });
});
