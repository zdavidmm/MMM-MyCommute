
/*********************************

  Magic Mirror Module: 
  MMM-MyCommute
  By Jeff Clarke

  Fork of mrx-work-traffic
  By Dominic Marx
  https://github.com/domsen123/mrx-work-traffic

  MIT Licensed
 
*********************************/

Module.register('MMM-MyCommute', {

  defaults: {
    apikey: '',
    showHeader: true,
    headerText: 'My Commute',
    origin: '65 Front St W, Toronto, ON M5J 1E6',
    startTime: '00:00',
    endTime: '23:59',
    showSummary: true,
    poorTimeThreshold: 1.3,
    moderateTimeThreshold: 1.1,
    colorCodeTravelTime: true,
    showSummary: true,
    colorCodeTravelTime: true,
    moderateTimeThreshold: 1.1,
    poorTimeThreshold: 1.3,
    destinations: [
      {
        destination: '40 Bay St, Toronto, ON M5J 2X2',
        label: 'Air Canada Centre',
        mode: 'walking',
        time: null
      },
      {
        destination: '317 Dundas St W, Toronto, ON M5T 1G4',
        label: 'Art Gallery of Ontario',
        mode: 'transit',
        time: null
      },
      {
        destination: '55 Mill St, Toronto, ON M5A 3C4',
        label: 'Distillery',
        mode: 'bicycling',
        time: null
      },
      {
        destination: '6301 Silver Dart Dr, Mississauga, ON L5P 1B2',
        label: 'Pearson Airport',
        time: null
      }
    ]
  },

  // Define required scripts.
  getScripts: function() {
    return ["moment.js"];
  },
  
  // Define required styles.
  getStyles: function () {
    return ["MMM-MyCommute.css", "font-awesome.css"];
  },

  // Icons to use for each transportation mode
  symbols: {
    'driving':          'car',
    'walking':          'walk',
    'bicycling':        'bike',
    'tram':             'streetcar',
    'bus':              'bus',
    'subway':           'subway',
    'train':            'train',
    'rail':             'train',
    'high_speed_train': 'train'
  },

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

    Log.info('Starting module: ' + this.name);

    this.loaded = false;
    this.payload = [];
    for(var i = 0; i<this.config.destinations.length; i++) {
      var _url = 'https://maps.googleapis.com/maps/api/directions/json' + this.getParams(this.config.destinations[i]);
      this.payload.push( {url: _url, label: this.config.destinations[i].label} );
    }

    this.askGoogle();
    var self = this;

    setInterval(function(){
      self.askGoogle();
    },600000);
      
  },

  svgIconFactory: function(glyph) {

    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttributeNS(null, "class", "transit-mode-icon");
    var use = document.createElementNS('http://www.w3.org/2000/svg', "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "modules/MMM-MyCommute/icon_sprite.svg#" + glyph);
    svg.appendChild(use);
    
    return(svg);
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

    params += '&departure_time=now'; //needed for time based on traffic conditions
    if (dest.avoid != null && this.avoidOptions.indexOf(dest.avoid) != -1) {
      params += '&avoid=' + dest.avoid;
    }
    return params;
  },
  
  askGoogle: function() {
    console.log("getting Google Traffic");
    this.sendSocketNotification("GOOGLE_TRAFFIC_GET", this.payload);
  },
  
  // Override dom generator.
  getDom: function() {

    var now = moment();
    var startTimeSplit = this.config.startTime.split(":");
    var endTimeSplit = this.config.endTime.split(":");
    var startTime = moment().hour(startTimeSplit[0]).minute(startTimeSplit[1]);
    var endTime = moment().hour(endTimeSplit[0]).minute(endTimeSplit[1]);


    var wrapper = document.createElement("div");
    
    /*
      Only show the module between the config's startTime and endTime parameters
    */
    if( now.isSameOrAfter(startTime) && now.isSameOrBefore(endTime) ){

      if (this.config.showHeader) {      
        var header = document.createElement("header");
        header.classList.add("module-header");
        header.innerHTML = this.config.headerText;
        wrapper.appendChild(header);
      } 

      for (var i = 0; i < this.config.destinations.length; i++) {
        var row = document.createElement("div");
        row.classList.add("row");
        
        var icon = document.createElement("span");
        icon.className = "transit-mode bright";
        var symbolIcon = 'car';
        
        if (this.config.destinations[i].mode) {
          if (this.config.destinations[i].mode == 'transit') {
            if (this.config.destinations[i].transitMode && this.symbols[this.config.destinations[i].transitMode.split("|")[0]]) {
              symbolIcon = this.symbols[this.config.destinations[i].transitMode.split("|")[0]];
            } else if (this.config.destinations[i].transfers) {
              symbolIcon = this.symbols[this.config.destinations[i].transfers[0].vehicle.toLowerCase()];
            } else {
              symbolIcon = 'streetcar';
            }
          } else if (this.symbols[this.config.destinations[i].mode] != null) {
            symbolIcon = this.symbols[this.config.destinations[i].mode];
          }
        }
        if (this.config.destinations[i].color) {
          icon.setAttribute("style", "color:" + this.config.destinations[i].color);
        }

        var svg = this.svgIconFactory(symbolIcon);
        icon.appendChild(svg);

        row.appendChild(icon);
        
        var destination = document.createElement("span");
        destination.className = "destination-label bright";
        destination.innerHTML = this.config.destinations[i].label;
        row.appendChild(destination);
        
        var time = document.createElement("span");
        time.className = "travel-time";

        if (this.config.destinations[i].time) {
          time.innerHTML =  (this.config.destinations[i].timeInTraffic ? this.config.destinations[i].timeInTraffic : this.config.destinations[i].time) + " min";

          var variance = (this.config.destinations[i].timeInTraffic ? this.config.destinations[i].timeInTraffic / this.config.destinations[i].time : 1);

          if (this.config.colorCodeTravelTime) {            
            if (variance > this.config.poorTimeThreshold) {
              time.classList.add("status-poor");
            } else if (variance > this.config.moderateTimeThreshold) {
              time.classList.add("status-moderate");
            } else {
              time.classList.add("status-good");
            }
          } 

        } else {
          time.innerHTML = "<i class='fa fa-spin fa-circle-o-notch'></i>"; //font-awesome spinning circle icon
        }

        row.appendChild(time);

        if (this.config.showSummary) {        
          var routeSummary = document.createElement("span");
          routeSummary.classList.add("route-summary");
          if (this.config.destinations[i].mode == 'transit' && this.config.destinations[i].transfers) {

            for (var j = 0; j < this.config.destinations[i].transfers.length; j++) {
              var transitLeg = document.createElement("span");
              transitLeg.classList.add("transit-leg");
              transitLeg.appendChild(this.svgIconFactory(this.symbols[this.config.destinations[i].transfers[j].vehicle.toLowerCase()]));

              var routeNo = document.createElement("span");
              routeNo.innerHTML = this.config.destinations[i].transfers[j].number;
              transitLeg.appendChild(routeNo);

              routeSummary.appendChild(transitLeg);
            }

            row.appendChild(routeSummary);

          } else if (this.config.destinations[i].summary)  {          
            routeSummary.innerHTML = this.config.destinations[i].summary;
            row.appendChild(routeSummary);
          }
        } 

        wrapper.appendChild(row);
      }

    }

    return wrapper;
  },
  
  socketNotificationReceived: function(notification, payload) {
    if ( notification === 'GOOGLE_TRAFFIC_LIST' ) {
      for(var i = 0; i<this.config.destinations.length; i++) {
        if( this.config.destinations[i].label === decodeURIComponent(payload.label)) {
          this.config.destinations[i].time = Math.floor(payload.duration / 60);
          this.config.destinations[i].timeInTraffic = Math.floor(payload.traffic_duration / 60);
          this.config.destinations[i].summary = payload.summary;
          this.config.destinations[i].transfers = payload.transfers;
        }

      }
      this.updateDom();
    }
  }
});