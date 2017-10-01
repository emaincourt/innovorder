import Boom from 'boom';

beforeEach(() => {
  jest.resetModules();
});

describe('Handler', () => {
  it('deletes a schedule according to its id', async () => {
    expect.assertions(3);
    jest.mock('../../sequelize/models', () => ({
      schedule: {
        findById: (id) => {
          expect(id).toEqual('any-schedule-id');
          return Promise.resolve({
            destroy: () => Promise.resolve(),
          });
        },
      },
    }));
    const DeleteSchedule = require('../../services/service-restaurants/delete-schedule').default;
    await expect(
      DeleteSchedule.handler({
        params: {
          scheduleId: 'any-schedule-id',
        },
      }, (response) => {
        expect(response).toEqual({});
      }),
    ).resolves.toMatchSnapshot();
  });

  it('forwards the error if one gets thrown during the deletion', async () => {
    it('deletes a schedule according to its id', async () => {
      expect.assertions(3);
      jest.mock('../../sequelize/models', () => ({
        schedule: {
          findById: (id) => {
            expect(id).toEqual('any-schedule-id');
            return Promise.resolve({
              destroy: () => Promise.reject(new Error()),
            });
          },
        },
      }));
      const DeleteSchedule = require('../../services/service-restaurants/delete-schedule').default;
      await expect(
        DeleteSchedule.handler({
          params: {
            scheduleId: 'any-schedule-id',
          },
        }, (response) => {
          expect(response).toEqual(Boom.wrap(new Error()));
        }),
      ).resolves.toMatchSnapshot();
    });
  });
});
