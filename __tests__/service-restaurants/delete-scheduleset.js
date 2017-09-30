import Boom from 'boom';

beforeEach(() => {
  jest.resetModules();
});

describe('Handler', () => {
  it('deletes a scheduleset according to its id', async () => {
    expect.assertions(4);
    jest.mock('../../sequelize/models', () => ({
      schedule: {
        findAll: (query) => {
          expect(query).toEqual({ where: { scheduleSetId: 'any-scheduleset-id' } });
          return Promise.resolve([{
            destroy: () => Promise.resolve(),
          }]);
        },
      },
      scheduleSet: {
        findById: (id) => {
          expect(id).toEqual('any-scheduleset-id');
          return Promise.resolve({
            destroy: () => Promise.resolve(),
          });
        },
      },
    }));
    const DeleteScheduleSet = require('../../services/service-restaurants/delete-scheduleset').default;
    await expect(
      DeleteScheduleSet.handler({
        params: {
          scheduleSetId: 'any-scheduleset-id',
        },
      }, (response) => {
        expect(response).toEqual({});
      }),
    ).resolves.toMatchSnapshot();
  });

  it('forwards the error if one gets thrown during the deletion', async () => {
    expect.assertions(4);
    jest.mock('../../sequelize/models', () => ({
      schedule: {
        findAll: (query) => {
          expect(query).toEqual({ where: { scheduleSetId: 'any-scheduleset-id' } });
          return Promise.resolve([{
            destroy: () => Promise.resolve(),
          }]);
        },
      },
      scheduleSet: {
        findById: (id) => {
          expect(id).toEqual('any-scheduleset-id');
          return Promise.resolve({
            destroy: () => Promise.reject(new Error()),
          });
        },
      },
    }));
    const DeleteScheduleSet = require('../../services/service-restaurants/delete-scheduleset').default;
    await expect(
      DeleteScheduleSet.handler({
        params: {
          scheduleSetId: 'any-scheduleset-id',
        },
      }, (response) => {
        expect(response).toEqual(Boom.wrap(new Error()));
      }),
    ).resolves.toMatchSnapshot();
  });
});
