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
|Option|Description|
|---|---|
|`apiKey`|**REQUIRED** API Key from Google<br><br>**Type:** `string`|
|`showHeader`|Whether to show the module header<br><br>**Type:** `boolean`<br>Defaults to `true`|
|`headerText`|Text to show in the header<br><br>**Type:** `string`<br>Defaults to `My Commute`|
|`origin`|**REQUIRED** The starting point for your commute.  Usually this is you home address.<br><br>**Type:** `string`<br>This is as you would see it Google Maps.  Example:  `65 Front St W, Toronto, ON M5J 1E6`|
|`startTime`|The start time of the window during which this module wil be visible.<br><br>**Type:** `string`<br>Must be in 24-hour time format.  Defaults to `00:00` (i.e.: midnight)|
|`endTime`|The end time of the window during which this module wil be visible.<br><br>**Type:** `string`<br>Must be in 24-hour time format.  Defaults to `23:59` (i.e.: one minute before midnight)|
|`destinations`|An array of destinations to which you would like to see commute times.<br><br>**Type:** `array` of objects.<br>See below for destination options.|

Each object in the `destinations` array has the following parameters:

|Option|Description|
|---|---|
|`destination`|**REQUIRED** The address of the destination<br><br>**Type:** `string`|
|`label`|**REQUIRED** How you would like this displayed on your MagicMirror.<br><br>**Type:** `string`|
|`mode`|Transportation mode, one of the following: `driving`, `walking`, `bicycling`, `transit`.<br><br>**Type:** `string`<br>Defaults to `driving`.|
|`color`|If specified, the colour for the icon in hexadecimal format (e.g.: `"#82BAE5"`)<br><br>**Type:** `string`<br>Defaults to white.|



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
        label: 'Pearson Airport'
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