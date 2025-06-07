const request = require('request');
const nock = require('nock');
const assert = require('assert');

describe('Google Routes API', function() {
  it('returns 403 error', function(done) {
    const scope = nock('https://routes.googleapis.com')
      .post('/directions/v2:computeRoutes')
      .query({ key: 'BAD' })
      .reply(403, { error: 'forbidden' });

    request({
      url: 'https://routes.googleapis.com/directions/v2:computeRoutes?key=BAD',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'routes.duration,routes.legs.duration,routes.legs.staticDuration,routes.legs.steps'
      },
      body: JSON.stringify({})
    }, function(err, response, body) {
      assert.strictEqual(response.statusCode, 403);
      scope.done();
      done();
    });
  });
});
