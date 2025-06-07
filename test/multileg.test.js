const nock = require('nock');
const assert = require('assert');
const Module = require('module');

// stub node_helper used by node_helper.js
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'node_helper') {
    return { create: obj => obj };
  }
  return originalLoad(request, parent, isMain);
};
const helper = require('../node_helper.js');
Module._load = originalLoad;

describe('Multi leg prediction', function() {
  it('sums durations across legs', function(done) {
    const dest = {
      legs: [
        {
          url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
          body: {},
          config: { mode: 'driving' }
        },
        {
          url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
          body: {},
          config: { mode: 'train' }
        }
      ],
      config: { label: 'Test', mode: 'multiple' }
    };

    const scope = nock('https://routes.googleapis.com')
      .post('/directions/v2:computeRoutes')
      .reply(200, { routes: [{ summary: 'leg1', legs: [{ duration: '10s', staticDuration: '10s' }] }] })
      .post('/directions/v2:computeRoutes')
      .reply(200, { routes: [{ summary: 'leg2', legs: [{ duration: '20s', staticDuration: '20s' }] }] });

    helper.getMultiLegPrediction(dest, prediction => {
      assert.strictEqual(prediction.routes[0].time, 30);
      assert.strictEqual(dest.config.time, 30);
      scope.done();
      done();
    });
  });
});
