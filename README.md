# BCS Promise
A JavaScript library to interface with the BCS using Promises/Futures.  Primarily tested in the browser, but should work with or easily adapt to node.js.

## Dependencies
* [browser-request][browser-request] - for making asynchronous calls to the BCS
* [Q][Q] - for Promises support

The versions of these dependencies used for testing are included in this repository in the vendor/js directory, but other versions may work as well.

## Usage

### BCS.Device
BCS.Device provides a very thin wrapper to communicate with the BCS.  When initializing the BCS.Device object, the BCS is queried to ensure connectivity and to determine the type of the device.  You should wait until the ready event is triggered before using the API.

For example:

```javascript
var bcs = new BCS.Device('192.168.0.63');
bcs.on('ready', function () {
    bcs.read('device').then(function (response) {
        console.log("BCS Name: " + response.name);
    });
});
```

### BCS.Helpers
The constructor for BCS.Device also adds a helpers property that is an instance of BCS.Helpers.  This class provides some helper methods to make working with data from the BCS easier.

For example:

```javascript
var bcs = new BCS.Device('192.168.0.63');
bcs.on('ready', function () {
    bcs.helpers.getTempValues().then(function (temps) {
        console.log("Temp probe 1 temperature: " + response[0]);
    });
});
```
	
## License
Copyright (c) 2014 Brent Rahn
Licensed under the MIT license.


[browser-request]: https://github.com/iriscouch/browser-request "iriscouch/browser-request · GitHub"
[Q]: https://github.com/kriskowal/q "kriskowal/q · GitHub"
