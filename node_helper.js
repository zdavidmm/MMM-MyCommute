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

    var returned = 0;
    var predictions = new Array();

                payload.destinations.forEach(function(dest, index) {
                        request({
                          url: dest.url,
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-Goog-FieldMask': 'routes.duration,routes.legs.duration,routes.legs.staticDuration,routes.legs.steps'
                          },
                          body: JSON.stringify(dest.body)
                        }, function(error, response, body) {
				
        var prediction = new Object({
          config: dest.config
        });

        if(!error && response.statusCode == 200){

          var data = JSON.parse(body);


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

          }

        } else {
          console.log( "Error getting traffic prediction: " + response.statusCode );
          prediction.error = true;

        }

        predictions[index] = prediction;
        returned++;

        if (returned == payload.destinations.length) {          
          self.sendSocketNotification('GOOGLE_TRAFFIC_RESPONSE' + payload.instanceId, predictions);
        };

      });
    });
	}
	
});