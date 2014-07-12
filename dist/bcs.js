/*! bcs-promises - v0.1.0 - 2014-07-12 */var BCS={version:"0.1.0"};BCS.Helpers=function(){var a=function(a){this.device=a};return a.prototype.getProbes=function(){for(var a=[],b=0;b<this.device.probeCount;b++)a.push(this.device.read("temp/"+b));return Q.all(a)},a.prototype.getTempValues=function(){return this.device.read("temp").then(function(a){return Q.all(a.map(function(a){return a/10}))})},a.prototype.getDins=function(){for(var a=[],b=0;b<this.device.inputCount;b++)a.push(this.device.read("din/"+b));return Q.all(a)},a.prototype.getDinValues=function(){return this.device.read("din")},a.prototype.getOutputs=function(){for(var a=[],b=0;b<this.device.outputCount;b++)a.push(this.device.read("output/"+b));return Q.all(a)},a.prototype.getOutputValues=function(){return this.device.read("output")},a.prototype.getTimerValues=function(a){return this.device.read("process/"+a+"/timer").then(function(a){return Q.all(a.map(function(a){return new BCS.Time(a.value)}))})},a.prototype.getTimerStrings=function(a){return this.getTimerValues(a).then(function(a){return Q.all(a.map(function(a){return a.toString()}))})},a}(),BCS.Device=function(){var a=function(a){var b=this;return this.address=a,this.ready=!1,this.type=null,this.version=null,this.helpers=new BCS.Helpers(this),this.url=(this.address.match(/^http/)?"":"http://")+this.address+(this.address.match(/\/$/)?"":"/")+"api/",this._callbacks={},this.read("device").then(function(a){b.ready=!0,b.version=a.version,b.type=a.type,b.trigger("ready")}).catch(function(a){b.trigger("notReady",a)}),this};return a.prototype={get probeCount(){return this.ready?"BCS-460"===this.type?4:8:null},get inputCount(){return this.ready?"BCS-460"===this.type?4:8:null},get outputCount(){return this.ready?"BCS-460"===this.type?6:18:null}},a.prototype.on=function(a,b){void 0===this._callbacks[a]?this._callbacks[a]=[b]:this._callbacks[a].push(b)},a.prototype.trigger=function(a,b){var c=this;void 0!==this._callbacks[a]&&this._callbacks[a].forEach(function(a){a.apply(c,b)})},a.prototype.read=function(a){var b=Q.defer();return request({url:this.url+a,json:!0},function(a,c,d){return a?void b.reject(a):void b.resolve(d)}),b.promise},a.prototype.write=function(a,b){var c=Q.defer();return request({url:this.url+a,json:b,method:"POST"},function(a,b,d){return a&&202!==b.statusCode?void c.reject(a):void c.resolve(d)}),c.promise},a}(),BCS.Time=function(){var a=function(a){return this.value=a/10||0,this},b=function(a){return 10>a?"0"+a:""+a};return a.prototype.toString=function(){var a=Math.floor(this.value/3600),c=Math.floor(this.value%3600/60),d=Math.floor(this.value%60);return a+":"+b(c)+":"+b(d)},a.fromString=function(b){for(var c=b.split(":").reverse(),d=0,e=0;e<c.length;e++){if(e>2)return new a(d);d+=parseInt(c[e])*Math.pow(60,e)}return new a(10*d)},a}();