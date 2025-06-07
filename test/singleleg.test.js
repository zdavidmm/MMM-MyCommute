const nock = require('nock');
const assert = require('assert');
const Module = require('module');

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'node_helper') {
    return { create: obj => obj };
  }
  return originalLoad(request, parent, isMain);
};
const helper = require('../node_helper.js');
Module._load = originalLoad;

describe('Single leg prediction', function() {
  it('sets time on destination config', function(done) {
    const dest = {
      url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
      body: {},
      config: { label: 'Test' }
    };

    const scope = nock('https://routes.googleapis.com')
      .post('/directions/v2:computeRoutes')
      .reply(200, { routes: [{ summary: 'leg', legs: [{ duration: '15s', staticDuration: '15s' }] }] });

    helper.sendSocketNotification = function(notification, payload) {
      assert.strictEqual(payload[0].routes[0].time, 15);
      assert.strictEqual(dest.config.time, 15);
      scope.done();
      done();
    };

    helper.getPredictions({ destinations: [{ url: dest.url, body: dest.body, config: dest.config }], instanceId: '1' });
  });
});
