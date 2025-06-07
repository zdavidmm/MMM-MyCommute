/* Magic Mirror
 * Module: mrx-work-traffic
 *
 * By Dominic Marx
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
var moment = require('moment');
 
module.exports = NodeHelper.create({

  start: function() {
    console.log("====================== Starting node_helper for module [" + this.name + "]");
  },
  
  
  // subclass socketNotificationReceived
  socketNotificationReceived: function(notification, payload){
    if (notification === 'GOOGLE_TRAFFIC_GET') {

      //first data opull after new config
      this.getPredictions(payload);

    }
  },


	
        getPredictions: function(payload) {
                var self = this;

    console.log("MMM-MyCommute: fetching predictions for instance " + payload.instanceId);
    var returned = 0;
    var predictions = new Array();

                payload.destinations.forEach(function(dest, index) {
            console.log("MMM-MyCommute: requesting route for destination index " + index);
            if (dest.multiple) {
                self.getMultiLegPrediction(dest, function(prediction) {
                    predictions[index] = prediction;
                    returned++;
                    if (returned == payload.destinations.length) {
                        console.log("MMM-MyCommute: sending multi-leg predictions to instance " + payload.instanceId);
                        self.sendSocketNotification('GOOGLE_TRAFFIC_RESPONSE' + payload.instanceId, predictions);
                    }
                });
                return;
            }

                        request({
                          url: dest.url,
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-Goog-FieldMask': 'routes.duration,routes.legs.duration,routes.legs.staticDuration,routes.legs.steps'
                          },
                          body: JSON.stringify(dest.body)
                        }, function(error, response, body) {
        console.log("Request URL: " + dest.url);
        console.log("Request Body: " + JSON.stringify(dest.body));
        if (error) {
          console.error("Request Error:", error);
        }
        if (response) {
          console.log("Response Status Code:", response.statusCode);
        }
        if (body) {
          console.log("Response Body:", body);
        }
				
        var prediction = new Object({
          config: dest.config
        });

        if(!error && response && response.statusCode == 200){

          var data;
          try {
            data = JSON.parse(body);
          } catch (e) {
            console.error("MMM-MyCommute: Failed to parse response JSON", e);
            prediction.error = true;
            data = null;
          }

          if (data) {


          if (data.error && data.error.message) {
            console.log("MMM-MyCommute: " + data.error.message);
            prediction.error = true;
          } else {

            var routeList = new Array();
            for (var i = 0; i < data.routes.length; i++) {
              var r = data.routes[i];
              var leg = r.legs[0];
              var routeObj = new Object({
                summary: r.summary || '',
                time: leg.staticDuration ? parseInt(leg.staticDuration.replace('s','')) : parseInt(leg.duration.replace('s',''))
              });

              if (leg.duration) {
                routeObj.timeInTraffic = parseInt(leg.duration.replace('s',''));
              }
              if (dest.config.mode && dest.config.mode == 'transit' && leg.steps) {
                var transitInfo = new Array();
                var gotFirstTransitLeg = false;
                for (var j = 0; j < leg.steps.length; j++) {
                  var s = leg.steps[j];

                  if (s.transitDetails) {
                    var arrivalTime = '';
                    if (!gotFirstTransitLeg && dest.config.showNextVehicleDeparture) {
                      gotFirstTransitLeg = true;
                      arrivalTime = moment(s.transitDetails.departureTime);
                    }
                    transitInfo.push({routeLabel: s.transitDetails.headsign || '', vehicle: s.transitDetails.vehicle, arrivalTime: arrivalTime});
                  }
                }
                if (transitInfo.length > 0) {
                  routeObj.transitInfo = transitInfo;
                }
              }
              routeList.push(routeObj);
            }
            prediction.routes = routeList;

            if (routeList.length > 0) {
              dest.config.time = routeList[0].timeInTraffic || routeList[0].time;
            }

          }

        } else {
          console.log( "Error getting traffic prediction: " + (response ? response.statusCode : 'NO RESPONSE') );
          prediction.error = true;

        }

        predictions[index] = prediction;
        returned++;

        if (returned == payload.destinations.length) {
          console.log("MMM-MyCommute: sending predictions to instance " + payload.instanceId);
          self.sendSocketNotification('GOOGLE_TRAFFIC_RESPONSE' + payload.instanceId, predictions);
        };

      });
    });
        }

        ,

        getMultiLegPrediction: function(dest, callback) {
            var self = this;
            var legIndex = 0;
            var totalTime = 0;
            var totalTimeInTraffic = 0;
            var summaries = [];
            var allTransitInfo = [];

            function processNextLeg() {
                if (legIndex >= dest.legs.length) {
                    var prediction = {
                        config: dest.config,
                        routes: [{
                            summary: summaries.join(' | '),
                            time: totalTime,
                            timeInTraffic: totalTimeInTraffic > 0 ? totalTimeInTraffic : null,
                            transitInfo: allTransitInfo.length > 0 ? allTransitInfo : null
                        }]
                    };
                    dest.config.time = totalTimeInTraffic > 0 ? totalTimeInTraffic : totalTime;
                    callback(prediction);
                    return;
                }

                var leg = dest.legs[legIndex];
                request({
                    url: leg.url,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-FieldMask': 'routes.duration,routes.legs.duration,routes.legs.staticDuration,routes.legs.steps'
                    },
                    body: JSON.stringify(leg.body)
                }, function(error, response, body) {
                    console.log('Request URL: ' + leg.url);
                    console.log('Request Body: ' + JSON.stringify(leg.body));
                    if (error) {
                        console.error('Request Error:', error);
                    }
                    if (response) {
                        console.log('Response Status Code:', response.statusCode);
                    }
                    if (body) {
                        console.log('Response Body:', body);
                    }

                    if(!error && response.statusCode == 200){
                        var data = JSON.parse(body);
                        if(!(data.error && data.error.message)) {
                            var r = data.routes[0];
                            var legRes = r.legs[0];
                            summaries.push(r.summary || '');
                            var time = legRes.staticDuration ? parseInt(legRes.staticDuration.replace('s','')) : parseInt(legRes.duration.replace('s',''));
                            totalTime += time;
                            if (legRes.duration) {
                                totalTimeInTraffic += parseInt(legRes.duration.replace('s',''));
                            }
                            if (leg.config.mode && leg.config.mode == 'transit' && legRes.steps) {
                                var transitInfo = [];
                                for (var j=0; j<legRes.steps.length; j++) {
                                    var s = legRes.steps[j];
                                    if (s.transitDetails) {
                                        transitInfo.push({routeLabel: s.transitDetails.headsign || '', vehicle: s.transitDetails.vehicle});
                                    }
                                }
                                if (transitInfo.length > 0) {
                                    allTransitInfo = allTransitInfo.concat(transitInfo);
                                }
                            }
                        }
                    }
                    legIndex++;
                    processNextLeg();
                });
            }

            processNextLeg();
        }

	
});