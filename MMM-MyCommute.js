
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
    'driving':    'car',
    'walking':    'walk',
    'bicycling':  'bike',
    'transit':    'streetcar'
  },

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
  
  getParams: function(dest) {
    var params = '?';
    params += 'origin=' + encodeURIComponent(this.config.origin);
    params += '&destination=' + encodeURIComponent(dest.destination);
    params += '&key=' + this.config.apikey;
    params += '&mode=' + (dest.mode == null || '' ? 'driving' : dest.mode);
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

      var table = document.createElement("table");
      table.className = "small";
      
      for (var i = 0; i < this.config.destinations.length; i++) {
        var row = document.createElement("tr");
        table.appendChild(row);
        
        var iconCell = document.createElement("td");
        iconCell.className = "transit-mode bright";
        var symbolIcon = 'car';
        if (this.config.destinations[i].mode != null && this.symbols[this.config.destinations[i].mode] != null) {
          symbolIcon = this.symbols[this.config.destinations[i].mode];
        }
        if (this.config.destinations[i].color) {
          iconCell.setAttribute("style", "color:" + this.config.destinations[i].color);
        }

        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttributeNS(null, "class", "transit-mode-icon");
        var use = document.createElementNS('http://www.w3.org/2000/svg', "use");
        use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "modules/MMM-MyCommute/icon_sprite.svg#" + symbolIcon);
        svg.appendChild(use);
        iconCell.appendChild(svg);

        row.appendChild(iconCell);
        
        var locationCell = document.createElement("td");
        locationCell.className = "destination-label bright";
        locationCell.innerHTML = this.config.destinations[i].label;
        row.appendChild(locationCell);
        
        var timeCell = document.createElement("td");
        timeCell.className = "travel-time";
        timeCell.innerHTML =  this.config.destinations[i].time ?  this.config.destinations[i].time + ' min' : "<i class='fa fa-spin fa-circle-o-notch'></i>";
        row.appendChild(timeCell);
      }

      wrapper.appendChild(table);

    }

    return wrapper;
  },
  
  socketNotificationReceived: function(notification, payload) {
    if ( notification === 'GOOGLE_TRAFFIC_LIST' ) {
      for(var i = 0; i<this.config.destinations.length; i++) {
        if( this.config.destinations[i].label === decodeURIComponent(payload.label))
          this.config.destinations[i].time = Math.floor( payload.duration / 60 );
      }
      this.updateDom();
    }
  }
});