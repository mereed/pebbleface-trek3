var CLEAR_DAY = 0;
var CLEAR_NIGHT = 1;
var WINDY = 2;
var COLD = 3;
var PARTLY_CLOUDY_DAY = 4;
var PARTLY_CLOUDY_NIGHT = 5;
var HAZE = 6;
var CLOUD = 7;
var RAIN = 8;
var SNOW = 9;
var HAIL = 10;
var CLOUDY = 11;
var STORM = 12;
var FOG = 13;
var NA = 14;

var imageId = {
  0 : STORM, //tornado
  1 : STORM, //tropical storm
  2 : STORM, //hurricane
  3 : STORM, //severe thunderstorms
  4 : STORM, //thunderstorms
  5 : HAIL, //mixed rain and snow
  6 : HAIL, //mixed rain and sleet
  7 : HAIL, //mixed snow and sleet
  8 : HAIL, //freezing drizzle
  9 : RAIN, //drizzle
  10 : HAIL, //freezing rain
  11 : RAIN, //showers
  12 : RAIN, //showers
  13 : SNOW, //snow flurries
  14 : SNOW, //light snow showers
  15 : SNOW, //blowing snow
  16 : SNOW, //snow
  17 : HAIL, //hail
  18 : HAIL, //sleet
  19 : HAZE, //dust
  20 : FOG, //foggy
  21 : HAZE, //haze
  22 : HAZE, //smoky
  23 : WINDY, //blustery
  24 : WINDY, //windy
  25 : COLD, //cold
  26 : CLOUDY, //cloudy
  27 : CLOUDY, //mostly cloudy (night)
  28 : CLOUDY, //mostly cloudy (day)
  29 : PARTLY_CLOUDY_NIGHT, //partly cloudy (night)
  30 : PARTLY_CLOUDY_DAY, //partly cloudy (day)
  31 : CLEAR_NIGHT, //clear (night)
  32 : CLEAR_DAY, //sunny
  33 : CLEAR_NIGHT, //fair (night)
  34 : CLEAR_DAY, //fair (day)
  35 : HAIL, //mixed rain and hail
  36 : CLEAR_DAY, //hot
  37 : STORM, //isolated thunderstorms
  38 : STORM, //scattered thunderstorms
  39 : STORM, //scattered thunderstorms
  40 : STORM, //scattered showers
  41 : SNOW, //heavy snow
  42 : SNOW, //scattered snow showers
  43 : SNOW, //heavy snow
  44 : CLOUD, //partly cloudy
  45 : STORM, //thundershowers
  46 : SNOW, //snow showers
  47 : STORM, //isolated thundershowers
  3200 : NA, //not available
};

var options = JSON.parse(localStorage.getItem('options'));
//console.log('read options: ' + JSON.stringify(options));
if (options === null) options = {
				"use_gps" : "true",
				"location" : "",
				"units" : "fahrenheit",
				"status" : "true",
				"language" : "",
				"format" : "",
				"weatherstatus" : "false",
				"bluetoothvibe_status" : "false",
				"hourlyvibe" : "false",
				"ampmsecs" : "false",
				"background" : "",
				"invert" : "false",
				"textcol" : "false",
				"startday_status" : "false",
				"steps_status" : "false"};

function getWeatherFromLatLong(latitude, longitude) {
  var response;
  var location_name = "";
  var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude;
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        response = JSON.parse(req.responseText);
        if (response) {
          location_name = response.results[0].formatted_address;
          getWeatherFromLocation(location_name);
        }
      } else {
        console.log("Error LatLong");
      }
    }
  };
  req.send(null);
}

function getWeatherFromLocation(location_name) {
  var response;
  var woeid = -1;

  var query = encodeURI("select woeid from geo.places(1) where text=\"" + location_name + "\"");
  var url = "http://query.yahooapis.com/v1/public/yql?q=" + query + "&format=json";
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        // console.log(req.responseText);
        response = JSON.parse(req.responseText);
        if (response) {
          woeid = response.query.results.place.woeid;
          getWeatherFromWoeid(woeid);
        }
      } else {
        console.log("Error Location");
      }
    }
  };
  req.send(null);
}

function getWeatherFromWoeid(woeid) {
  var celsius = options['units'] == 'celsius';
  var query = encodeURI("select item.condition from weather.forecast where woeid = " + woeid +
                        " and u = " + (celsius ? "\"c\"" : "\"f\""));
  var url = "http://query.yahooapis.com/v1/public/yql?q=" + query + "&format=json";

  var response;
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        response = JSON.parse(req.responseText);
        if (response) {
          var condition = response.query.results.channel.item.condition;
          temperature = condition.temp + (celsius ? "\u00B0" : "\u00B0");
          icon = imageId[condition.code];
           console.log("temp " + temperature);
           console.log("icon " + icon);
          // console.log("condition " + condition.text);
          Pebble.sendAppMessage({
            "icon" : icon,
            "temperature" : temperature,
			"format" : options["format"],
			"language" : options["language"],
			"background" : options["background"],
			"status" : (options["status"] == "true" ? 1 : 0 ),
			"weatherstatus" : (options["weatherstatus"] == "true" ? 0 : 1 ),
			"bluetoothvibe_status" : (options["bluetoothvibe_status"] == "true" ? 1 : 0 ),
			"hourlyvibe" : (options["hourlyvibe"] == "true" ? 1 : 0 ),
			"ampmsecs" : (options["ampmsecs"] == "true" ? 1 : 0 ),
			"textcol" : (options["textcol"] == "true" ? 0 : 1 ),
			"invert" : (options["invert"] == "true" ? 0 : 1),
			"startday_status" : (options["startday_status"] == "true" ? 1 : 0 ),
			"steps_status" : (options["steps_status"] == "true" ? 0 : 1 ),

          });
        }
      } else {
        console.log("Error WOEID");
      }
    }
  };
  req.send(null);
}

function updateWeather() {
  if (options['use_gps'] == "true") {
//    navigator.geolocation.getCurrentPosition(locationSuccess,
    window.navigator.geolocation.getCurrentPosition(locationSuccess,
                                                    locationError,
                                                    locationOptions);
  } else {
    getWeatherFromLocation(options["location"]);
  }
}

//var locationOptions = { "timeout": 30000, "maximumAge": 60000 };
var locationOptions = { "timeout": 15000, "maximumAge": 60000 };

function locationSuccess(pos) {
  var coordinates = pos.coords;
  getWeatherFromLatLong(coordinates.latitude, coordinates.longitude);
}

function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
  Pebble.sendAppMessage({
    "icon":11,
    "temperature":"   "
  });
}

Pebble.addEventListener('showConfiguration', function(e) {
	var uri = 'http://www.themapman.com/pebblewatch/trekv6.html?' + 
    'use_gps=' + encodeURIComponent(options['use_gps']) +
    '&location=' + encodeURIComponent(options['location']) +
    '&units=' + encodeURIComponent(options['units']) +
    '&status=' + encodeURIComponent(options['status']) +
    '&format=' + encodeURIComponent(options['format']) +
    '&language=' + encodeURIComponent(options['language']) +
    '&weatherstatus=' + encodeURIComponent(options['weatherstatus']) +
    '&bluetoothvibe_status=' + encodeURIComponent(options['bluetoothvibe_status']) +
    '&hourlyvibe=' + encodeURIComponent(options['hourlyvibe']) +
    '&ampmsecs=' + encodeURIComponent(options['ampmsecs']) +
    '&background=' + encodeURIComponent(options['background']) +
    '&invert=' + encodeURIComponent(options['invert']) +
    '&textcol=' + encodeURIComponent(options['textcol']) +
    '&startday_status=' + encodeURIComponent(options['startday_status']) +
    '&steps_status=' + encodeURIComponent(options['steps_status']);

  //console.log('showing configuration at uri: ' + uri);

  Pebble.openURL(uri);
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e.response) {
    options = JSON.parse(decodeURIComponent(e.response));
    localStorage.setItem('options', JSON.stringify(options));
    //console.log('storing options: ' + JSON.stringify(options));
    updateWeather();
  } else {
    console.log('no options received');
  }
});

Pebble.addEventListener("ready", function(e) {
  //console.log("connect!" + e.ready);
  updateWeather();
  setInterval(function() {
    //console.log("timer fired");
    updateWeather();
//  }, 60000); // 1 minutes
//  }, 300000); // 5 minutes
//    }, 600000); // 10 minutes
//  }, 1200000); // 20 minutes
  }, 1800000); // 30 minutes
  console.log(e.type);
});