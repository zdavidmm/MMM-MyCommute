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
      <td><code>apiKey</code></td>
      <td><strong>REQUIRED</strong> API Key from Google<br><br><strong>Type:</strong> <code>string</code></td>
    </tr>
    <tr>
      <td><code>showHeader</code></td>
      <td>Whether to show the module header<br><br><strong>Type:</strong> <code>boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>headerText<code></td>
      <td>Text to show in the header<br><br><strong>Type:</strong> <code>string</code><br>Defaults to <code>My Commute</code></td>
    </tr>
    <tr>
      <td><code>origin</code></td>
      <td><strong>REQUIRED</strong> The starting point for your commute.  Usually this is your home address.<br><br><strong>Type:</strong> <code>string</code><br>This is as you would see it Google Maps.  Example:  <code>65 Front St W, Toronto, ON M5J 1E6</code></td>
    </tr>
    <tr>
      <td><code>startTime</code></td>
      <td>The start time of the window during which this module wil be visible.<br><br><strong>Type:</strong> <code>string</code><br>Must be in 24-hour time format.  Defaults to <code>00:00</code> (i.e.: midnight)</td>
    </tr>
    <tr>
      <td><code>endTime</code></td>
      <td>The end time of the window during which this module wil be visible.<br><br><strong>Type:</strong> <code>string</code><br>Must be in 24-hour time format.  Defaults to <code>23:59</code> (i.e.: one minute before midnight)</td>
    </tr>
    <tr>
      <td><code>showSummary</code></td>
      <td>Whether to show a brief summary of the route<br><br><strong>Type:</strong> <code>boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>colorCodeTravelTime</code></td>
      <td>Whether to colour-code the travel time red, yellow, or green based on traffic.<br><br><strong>Type:</strong> <code>boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>moderateTimeThreshold</code></td>
      <td>The amount of variance between time in traffic vs absolute fastest time after which the time is coloured yellow<br><br><strong>Type:</strong> <code>float</code><br>Defaults to <code>1.1</code> (i.e.: 10% longer than fastest time)</td>
    </tr>
    <tr>
      <td><code>poorTimeThreshold</code></td>
      <td>The amount of variance between time in traffic vs absolute fastest time after which the time is coloured red<br><br><strong>Type:</strong> <code>float</code><br>Defaults to <code>1.3</code> (i.e.: 30% longer than fastest time)</td>
    </tr>
    <tr>
      <td><code>destinations</code></td>
      <td>An array of destinations to which you would like to see commute times.<br><br><strong>Type:</strong> <code>array</code> of objects.<br>See below for destination options.</td>
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
      <td><code>destination</code></td>
      <td><strong>REQUIRED</strong> The address of the destination<br><br><strong>Type:</strong> <code>string</code></td>
    </tr>
    <tr>
      <td><code>label</code></td>
      <td><strong>REQUIRED</strong> How you would like this displayed on your MagicMirror.<br><br><strong>Type:</strong> <code>string</code></td>
    </tr>
    <tr>
      <td><code>mode</code></td>
      <td>Transportation mode, one of the following: <code>driving</code>, <code>walking</code>, <code>bicycling</code>, <code>transit</code>.<br><br><strong>Type:</strong> <code>string</code><br>Defaults to <code>driving</code>.</td>
    </tr>
    <tr>
      <td><code>transitMode</code></td>
      <td>If <code>mode</code> = <code>transit</code> you can additionally specify one or more of the following: <code>bus</code>, <code>subway</code>, <code>train</code>, <code>tram</code>, or <code>rail</code>.<br><br><strong>Type:</strong> <code>string</code>.<br>Separate multiple entries with the <code>|</code> character (e.g.: <code>"transitMode" : "bus|subway|tram"</code>). Specifying <code>rail</code>indicates that the calculated route should prefer travel by train, tram, light rail, and subway.  Equivalenet to <code>train|tram|subway</code></td>
    </tr>
    <tr>
      <td><code>avoid</code></td>
      <td>If specified, will instruct the Google API to find a route that avoids one or more of the following: <code>tolls</code>,<code>highways</code>,<code>ferries</code>,<code>indoor</code>.<br><br><strong>Type:</strong> <code>string</code>.<br>Separate multiple entries with the <code>|</code> character (e.g.: <code>"avoid" : "highways|tolls"</code>).</td>
    </tr>
    <tr>
      <td><code>alternatives</code></td>
      <td>If specified, will instruct the Google API to provide times for alternate routes.  Must be used with <code>showSummary: true</code><br><br><strong>Type:</strong> <code>boolean</code></td>
    </tr>
    <tr>
      <td><code>color</code></td>
      <td>If specified, the colour for the icon in hexadecimal format (e.g.: <code>"#82BAE5"</code>)<br><br><strong>Type:</strong> <code>string</code><br>Defaults to white.</td>
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