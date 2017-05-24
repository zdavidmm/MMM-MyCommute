# MMM-MyCommute
This a module for the [MagicMirror](https://github.com/MichMich/MagicMirror/tree/develop).

It shows your commute time using Google's Traffic API (requires an API Key from Google).

It is a fork of `mrx-work-traffic` by Dominic Marx.
https://github.com/domsen123/mrx-work-traffic

# Installation
1. Navigate into your MagicMirror `modules` folder and execute<br>
`git clone https://github.com/jclarke0000/MMM-MyCommute.git`.
2. Go to https://developers.google.com/maps/documentation/javascript/get-api-key and get an API key.

# Config
<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Descriptio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`apiKey`</td>
      <td>**REQUIRED** API Key from Google<br><br>**Type:** `string`</td>
    </tr>
    <tr>
      <td>`showHeader`</td>
      <td>Whether to show the module header<br><br>**Type:** `boolean`<br>Defaults to `true`</td>
    </tr>
    <tr>
      <td>`headerText`</td>
      <td>Text to show in the header<br><br>**Type:** `string`<br>Defaults to `My Commute`</td>
    </tr>
    <tr>
      <td>`origin`</td>
      <td>**REQUIRED** The starting point for your commute.  Usually this is you home address.<br><br>**Type:** `string`<br>This is as you would see it Google Maps.  Example:  `65 Front St W, Toronto, ON M5J 1E6`</td>
    </tr>
    <tr>
      <td>`startTime`</td>
      <td>The start time of the window during which this module wil be visible.<br><br>**Type:** `string`<br>Must be in 24-hour time format.  Defaults to `00:00` (i.e.: midnight)</td>
    </tr>
    <tr>
      <td>`endTime`</td>
      <td>The end time of the window during which this module wil be visible.<br><br>**Type:** `string`<br>Must be in 24-hour time format.  Defaults to `23:59` (i.e.: one minute before midnight)</td>
    </tr>
    <tr>
      <td>`showSummary`</td>
      <td>Whether to show a brief summary of the route<br><br>**Type:** `boolean`<br>Defaults to `true`</td>
    </tr>
    <tr>
      <td>`colorCodeTravelTime`</td>
      <td>Whether to colour-code the travel time red, yellow, or green based on traffic.<br><br>**Type:** `boolean`<br>Defaults to `true`</td>
    </tr>
    <tr>
      <td>`moderateTimeThreshold`</td>
      <td>The amount of variance between time in traffic vs absolute fastest time after which the time is coloured yellow<br><br>**Type:** `float`<br>Defaults to `1.1` (i.e.: 10% longer than fastest time)</td>
    </tr>
    <tr>
      <td>`poorTimeThreshold`</td>
      <td>The amount of variance between time in traffic vs absolute fastest time after which the time is coloured red<br><br>**Type:** `float`<br>Defaults to `1.3` (i.e.: 30% longer than fastest time)</td>
    </tr>
    <tr>
      <td>`destinations`</td>
      <td>An array of destinations to which you would like to see commute times.<br><br>**Type:** `array` of objects.<br>See below for destination options.</td>
    </tr>
  </tbody>
</table>

Each object in the `destinations` array has the following parameters:

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`destination`</td>
      <td>**REQUIRED** The address of the destination<br><br>**Type:** `string`</td>
    </tr>
    <tr>
      <td>`label`</td>
      <td>**REQUIRED** How you would like this displayed on your MagicMirror.<br><br>**Type:** `string`</td>
    </tr>
    <tr>
      <td>`mode`</td>
      <td>Transportation mode, one of the following: `driving`, `walking`, `bicycling`, `transit`.<br><br>**Type:** `string`<br>Defaults to `driving`.</td>
    </tr>
    <tr>
      <td>`transitMode`</td>
      <td>If `mode` = `transit` you can additionally specify one or more of the following: `bus`, `subway`, `train`, `tram`, or `rail`.<br><br>**Type:** `string`<br>.Separate multiple entries with the `|` character (e.g.: `"transitMode" : "bus|subway|tram"`). Specifying `rail`indicates that the calculated route should prefer travel by train, tram, light rail, and subway.  Equivalenet to `train|tram|subway`</td>
    </tr>
    <tr>
      <td>`avoid`</td>
      <td>If specified, will instruct the Google API to find a route that avoids one of the following: `tolls`,`highways`,`ferries`,`indoor`.  Any other value will be ignored.  Only one option can be specified.<br><br>**Type:** `string`</td>
    </tr>
    <tr>
      <td>`color`</td>
      <td>If specified, the colour for the icon in hexadecimal format (e.g.: `"#82BAE5"`)<br><br>**Type:** `string`<br>Defaults to white.</td>
    </tr>
  </tbody>
</table>



Here is an example of an entry in `config.js`
```
{
  module: 'MMM-MyCommute',
  position: 'top_left',
  config: {
    showHeader: true,
    headerText: 'Traffic',
    apikey: 'API_KEY_FROM_GOOGLE',
    origin: '65 Front St W, Toronto, ON M5J 1E6',
    startTime: '00:00',
    endTime: '23:59',
    destinations: [
      {
        destination: '14 Duncan St Toronto, ON M5H 3G8',
        label: 'Air Canada Centre',
        mode: 'walking',
        color: '#82E5AA'
      },
      {
        destination: '317 Dundas St W, Toronto, ON M5T 1G4',
        label: 'Art Gallery of Ontario',
        mode: 'transit'
      },
      {
        destination: '55 Mill St, Toronto, ON M5A 3C4',
        label: 'Distillery District',
        mode: 'bicycling'
      },
      {
        destination: '6301 Silver Dart Dr, Mississauga, ON L5P 1B2',
        label: 'Pearson Airport',
        avoid: 'tolls'
      }
    ]
  }
}
```


## Dependencies
- [request](https://www.npmjs.com/package/request) (Likely already installed, installed via `npm install request`)

## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
- [Dominic Marx](https://github.com/domsen123) for creating the original mrx-work-traffic that this module heavily borrows upon.