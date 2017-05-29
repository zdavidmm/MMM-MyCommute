
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
    'transit':          'streetcar',
    'tram':             'streetcar',
    'bus':              'bus',
    'subway':           'subway',
    'train':            'train',
    'rail':             'train',
    'metro_rail':       'subway',
    'monorail':         'train',
    'heavy_rail':       'train',
    'commuter_train':   'train',
    'high_speed_train': 'train',
    'intercity_bus':    'bus',
    'trolleybus':       'streetcar',
    'share_taxi':       'taxi',
    'ferry':            'boat',
    'cable_car':        'gondola',
    'gondola_lift':     'gondola',
    'funicular':        'gondola',
    'other':            'streetcar'
  },  

  start: function() {

    Log.info('Starting module: ' + this.name);

    this.predictions = new Array();
    this.sendSocketNotification("GOOGLE_TRAFFIC_GET", this.config);
      
  },

  svgIconFactory: function(glyph) {

    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttributeNS(null, "class", "transit-mode-icon");
    var use = document.createElementNS('http://www.w3.org/2000/svg', "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "modules/MMM-MyCommute/icon_sprite.svg#" + glyph);
    svg.appendChild(use);
    
    return(svg);
  },

  formatTime: function(time, timeInTraffic) {

    var timeEl = document.createElement("span");
    timeEl.classList.add("travel-time");
    if (timeInTraffic != null) {
      timeEl.innerHTML = Math.floor(Number(timeInTraffic) / 60) + " min";

      var variance = timeInTraffic / time;
      if (this.config.colorCodeTravelTime) {            
        if (variance > this.config.poorTimeThreshold) {
          timeEl.classList.add("status-poor");
        } else if (variance > this.config.moderateTimeThreshold) {
          timeEl.classList.add("status-moderate");
        } else {
          timeEl.classList.add("status-good");
        }
      }

    } else {
      timeEl.innerHTML = Math.floor(Number(time) / 60) + " min";
      timeEl.classList.add("status-good");
    }

    return timeEl;

  },

  getTransitIcon: function(dest, route) {

    var transitIcon;

    if (dest.transitMode) {
      var transitIcon = dest.transitMode.split("|")[0];
      if (this.symbols[transitIcon] != null) {
        transitIcon = this.symbols[transitIcon];
      } else {
        transitIcon = this.symbols[route.transitInfo[0].vehicle.toLowerCase()];
      }
    } else {
      transitIcon = this.symbols[route.transitInfo[0].vehicle.toLowerCase()];
    }

    return transitIcon;

  },

  buildTransitSummary: function(transitInfo, summaryContainer) {

    for (var i = 0; i < transitInfo.length; i++) {    

      var transitLeg = document.createElement("span");
        transitLeg.classList.add('transit-leg');
        transitLeg.appendChild(this.svgIconFactory(this.symbols[transitInfo[i].vehicle.toLowerCase()]));

      var routeNumber = document.createElement("span");
        routeNumber.innerHTML = transitInfo[i].routeLabel;

      transitLeg.appendChild(routeNumber);
      summaryContainer.appendChild(transitLeg);
    }

  },

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

        var d = this.config.destinations[i];

        var row = document.createElement("div");
        row.classList.add("row");

        var destination = document.createElement("span");
        destination.className = "destination-label bright";
        destination.innerHTML = d.label;
        row.appendChild(destination);

        var icon = document.createElement("span");
        icon.className = "transit-mode bright";
        var symbolIcon = 'car';
        if (this.config.destinations[i].color) {
          icon.setAttribute("style", "color:" + this.config.destinations[i].color);
        }

        if (d.mode && this.symbols[d.mode]) {
          symbolIcon = this.symbols[d.mode];
        }


        //data yet?
        if (this.predictions[i]) {

          //different rendering for single route vs multiple
          if (this.predictions[i].routes.length == 1 || !this.config.showSummary) {

            var r = this.predictions[i].routes[0];

            row.appendChild( this.formatTime(r.time, r.timeInTraffic) );

            //summary?
            if (this.config.showSummary) {
              var summary = document.createElement("div");
                summary.classList.add("route-summary");

              if (r.transitInfo) {

                symbolIcon = this.getTransitIcon(d,r);
                this.buildTransitSummary(r.transitInfo, summary); 

              } else {
                summary.innerHTML = r.summary;
              }
              row.appendChild(summary);
            }


          } else {

            row.classList.add("with-multiple-routes");

            for (var j = 0; j < this.predictions[i].routes.length; j++) {
              var routeSummaryOuter = document.createElement("div");
              routeSummaryOuter.classList.add("route-summary-outer");

              var r = this.predictions[i].routes[j];

              routeSummaryOuter.appendChild( this.formatTime(r.time, r.timeInTraffic) );

              var summary = document.createElement("div");
                summary.classList.add("route-summary");

              if (r.transitInfo) {
                symbolIcon = this.getTransitIcon(d,r);
                this.buildTransitSummary(r.transitInfo, summary); 

              } else {
                summary.innerHTML = r.summary;
              }
              routeSummaryOuter.appendChild(summary);
              row.appendChild(routeSummaryOuter);

            } 

          }



        } else { //show loading loading icon
          var loadingIcon = document.createElement("i");
          loadingIcon.classList.add("loading-icon", "fa", "fa-spin", "fa-circle-o-notch");
          row.appendChild(loadingIcon);
        }
        

        var svg = this.svgIconFactory(symbolIcon);
        icon.appendChild(svg);
        row.appendChild(icon);
        
        

        wrapper.appendChild(row);
      }

    }

    return wrapper;
  },
  
  socketNotificationReceived: function(notification, payload) {
    if ( notification === 'GOOGLE_TRAFFIC_RESPONSE' ) {

      //insert response into correct index
      this.predictions[payload.index] = payload;

      //update dom
      this.updateDom();
    }
  }
});