/* Magic Mirror
 * Module: mrx-work-traffic
 *
 * By Dominic Marx
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
 
module.exports = NodeHelper.create({

  travelModes: [
    'driving',
    'walking',
    'bicycling',
    'transit'
  ],

  transitModes: [
    'bus',
    'subway',
    'train',
    'tram',
    'rail'
  ],

  avoidOptions: [
    'tolls',
    'highways',
    'ferries',
    'indoor'
  ],


  start: function() {
    console.log("====================== Starting node_helper for module [" + this.name + "]");

    //set up helper variables
    this.API_URL = 'https://maps.googleapis.com/maps/api/directions/json';
    this.POLL_FREQUENCY = 600000; //poll every 10 minutes

    this.dataPollStarted = false; //flag for whether the recurring data pull has been started
    this.urls = []; //container for the configured URLs

  },
  
  
  // subclass socketNotificationReceived
  socketNotificationReceived: function(notification, payload){
    if (notification === 'GOOGLE_TRAFFIC_GET') {

      this.config = payload;

      //build URLs
      this.urls = new Array();
      for(var i = 0; i < this.config.destinations.length; i++) {
        var url = 'https://maps.googleapis.com/maps/api/directions/json' + this.getParams(this.config.destinations[i]);
        this.urls.push( url );

        // console.log(url);
      }

      //first data opull after new config
      this.getPredictions();

      //set up recurring data pull
      var self = this;
      if (!this.dataPollStarted)
      setInterval(function(){
        self.getPredictions();
      },600000);

    }
  },

  getParams: function(dest) {

    var params = '?';
    params += 'origin=' + encodeURIComponent(this.config.origin);
    params += '&destination=' + encodeURIComponent(dest.destination);
    params += '&key=' + this.config.apikey;

    //travel mode
    var mode = 'driving';
    if (dest.mode && this.travelModes.indexOf(dest.mode) != -1) {
      mode = dest.mode;
    } 
    params += '&mode=' + mode;

    //transit mode if travelMode = 'transit'
    if (mode == 'transit' && dest.transitMode) {
      var tModes = dest.transitMode.split("|");
      var sanitizedTransitModes = '';
      for (var i = 0; i < tModes.length; i++) {
        if (this.transitModes.indexOf(tModes[i]) != -1) {
          sanitizedTransitModes += (sanitizedTransitModes == '' ? tModes[i] : "|" + tModes[i]);
        }
      }
      if (sanitizedTransitModes.length > 0) {
        params += '&transit_mode=' + sanitizedTransitModes;
      }
    } 
    if (dest.alternatives == true) {
      params += '&alternatives=true';
    }

    if (dest.waypoints) {
      var waypoints = dest.waypoints.split("|");
      for (var i = 0; i < waypoints.length; i++) {
        waypoints[i] = encodeURIComponent(waypoints[i]);
      }
      params += '&waypoints=' + waypoints.join("|");
    } 

    //avoid
    if (dest.avoid) {
      var a = dest.avoid.split("|");
      var sanitizedAvoidOptions = '';
      for (var i = 0; i < a.length; i++) {
        if (this.avoidOptions.indexOf(a[i]) != -1) {
          sanitizedAvoidOptions += (sanitizedAvoidOptions == '' ? a[i] : "|" + a[i]);
        }
      }
      if (sanitizedAvoidOptions.length > 0) {
        params += '&avoid=' + sanitizedAvoidOptions;
      }

    }

    params += '&departure_time=now'; //needed for time based on traffic conditions

    return params;

  },
	
	getPredictions: function() {
		var self = this;		

		this.urls.forEach(function(url, index) {
			request({url: url, method: 'GET'}, function(error, response, body) {
				
				if(!error && response.statusCode == 200){

					var data = JSON.parse(body);

          var prediction = new Object({
            index: index,
          });

          var routeList = new Array();
          for (var i = 0; i < data.routes.length; i++) {
            var r = data.routes[i];
            var routeObj = new Object({
              summary: r.summary,
              time: r.legs[0].duration.value
            });

            if (r.legs[0].duration_in_traffic) {
              routeObj.timeInTraffic = r.legs[0].duration_in_traffic.value;
            }
            if (self.config.destinations[index].mode && self.config.destinations[index].mode == 'transit') {
              var transitInfo = new Array();
              for (var j = 0; j < r.legs[0].steps.length; j++) {
                var s = r.legs[0].steps[j];
                if (s.transit_details) {
                  transitInfo.push({routeLabel: s.transit_details.line.short_name, vehicle: s.transit_details.line.vehicle.type});
                }
                routeObj.transitInfo = transitInfo;
              }
            }
            routeList.push(routeObj);
          }
          prediction.routes = routeList;


          self.sendSocketNotification('GOOGLE_TRAFFIC_RESPONSE', prediction);

				}
				else{
					console.log( "Error getting traffic prediction: " + response.statusCode );
				}
			});
		});
	}
	
});