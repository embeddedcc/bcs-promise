/*global BCS, describe, it, sinon, before, after, beforeEach, afterEach, XHR */
/*jshint -W030*/
/*jshint -W020*/

// Hack to make sinon work with request.js
sinon.FakeXMLHttpRequest.prototype.setRequestHeader = function setRequestHeader(header, value) {
//  verifyState(this);

//  if (unsafeHeaders[header] || /^(Sec-|Proxy-)/.test(header)) {
//      throw new Error("Refused to set unsafe header \"" + header + "\"");
//  }

  if (this.requestHeaders[header]) {
      this.requestHeaders[header] += "," + value;
  } else {
      this.requestHeaders[header] = value;
  }
};


describe('BCS.Device', function () {
	var bcs460, bcs462;
	var xhr, requests;

	before(function () {
		xhr = sinon.useFakeXMLHttpRequest();
		//hack for request.js
		XHR = xhr;
		requests = [];
		xhr.onCreate = function(req) {
			requests.push(req);
		};
	});
	
	after(function () {
		xhr.restore();
	});

	it('should be initializable', function (done) {
		var addr = "0.0.0.0";
		bcs460 = new BCS.Device(addr);
		bcs462 = new BCS.Device(addr);
		
		bcs460.should.have.property('version');
		bcs460.should.have.property('ready', false);
		bcs460.should.have.property('type');
		bcs460.should.have.property('url', 'http://' + addr + '/api/');
		bcs460.should.have.property('helpers');
		done();
	});
	
	it('should update callback when ready', function (done) {
		var count = 0;
		requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({version: "4.0.0", type: "BCS-460"}));
		requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({version: "4.0.0", type: "BCS-462"}));
		requests = [];
		bcs460.on('ready', function () {
			this.ready.should.equal(true);
			this.version.should.equal("4.0.0");
			this.type.should.equal("BCS-460");
			if(++count === 2) done();
		});

		bcs462.on('ready', function () {
			this.ready.should.equal(true);
			this.version.should.equal("4.0.0");
			this.type.should.equal("BCS-462");
			if(++count === 2) done();
		});

	});
	
	it('should support probeCount', function (done) {
		bcs460.probeCount.should.equal(4);
		bcs462.probeCount.should.equal(8);
		done();
	});

	it('should support inputCount', function (done) {
		bcs460.inputCount.should.equal(4);
		bcs462.inputCount.should.equal(8);
		done();
	});

	it('should support outputCount', function (done) {
		bcs460.outputCount.should.equal(6);
		bcs462.outputCount.should.equal(18);
		done();
	});

	it('should allow reading from the API', function (done) {
		bcs460.read('temp').then(function (v) {
			v.should.eql([1000, 1010, 1020, 1030]);
			requests = [];
			done();
		});
		requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify([1000, 1010, 1020, 1030]));
	});
	
	it('should allow writing to the API', function (done) {
		bcs460.write('temp/0', {name: "Happy Temp"}).then(function (v) {
			v.name.should.equal("Happy Temp");
			requests = [];
			done();
		});
		
		requests[0].method.should.equal("POST");
		requests[0].respond(200, {'Content-Type': 'application/json'}, requests[0].requestBody);
	});

});	

describe("BCS.Time", function () {
	it('should be initialized with a value', function (done) {
		var t = new BCS.Time(0);
		t.value.should.equal(0);
		done();
	});
	
	it('should create a time string using toString', function (done) {
		var t = new BCS.Time(630);
		t.toString().should.equal("0:01:03");
		done();
	});
	
	it('should convert from a string to a value', function (done) {
		var t = BCS.Time.fromString("01:04:55");
		t.value.should.equal(3895);
		t.toString().should.equal("1:04:55");
		done();
	});
});

describe("BCS.Helpers", function () {
	var bcs;
	var xhr, requests;

	beforeEach(function (done) {
		xhr = sinon.useFakeXMLHttpRequest();
		//hack for request.js
		XHR = xhr;
		requests = [];
		xhr.onCreate = function(req) {
			requests.push(req);
		};
		bcs = new BCS.Device("0.0.0.0");
		bcs.on('ready', done);
		requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({version: "4.0.0", type: "BCS-460"}));
	});
	
	afterEach(function () {
		xhr.restore();
	});

	it('getProbes should retrieve a list of probes', function (done) {
		bcs.helpers.getProbes()
			.then(function (probes) {
				probes.should.have.length(4);
				probes.forEach(function (probe, i) {
					probe.should.have.property('name', "Temp Probe " + i);
					probe.should.have.property('temp', 1035);
					probe.should.have.property('setpoint', null);
					probe.should.have.property('resistance', 5379);
					probe.should.have.property('enabled');
					probe.enabled.should.be.true;
					probe.should.have.property('coefficients');
					probe.coefficients.should.have.length(3);
				});
				done();
			})
			.catch(done);

			requests.slice(1).forEach(function (req, i) {
				req.respond(200, 
					{'Content-Type': 'application/json'}, 
					'{"name":"Temp Probe ' + i + '","temp":1035,"setpoint":null,"resistance":5379,"enabled":true,"coefficients":[0.0011371549,0.0002325949,9.5400029999e-8]}');
			});

	});
	
	it('getDins should retrieve a list of dins', function (done) {
		bcs.helpers.getDins()
			.then(function (dins) {
				dins.should.have.length(4);
				dins.forEach(function (din, i) {
					din.should.have.property('name', 'Discrete Input ' + i);
					din.should.have.property('on').and.be.false;
					din.should.have.property('enabled').and.be.true;
					din.should.have.property('oneshot').and.be.false;
				});
				done();
			})
			.catch(done);

			requests.slice(1).forEach(function (req, i) {
				req.respond(200, 
					{'Content-Type': 'application/json'}, 
					'{"name":"Discrete Input ' + i + '","on":false,"enabled":true,"oneshot":false}');
			});
			
	});

	it('getOutputs should retrieve a list of outputs', function (done) {
		bcs.helpers.getOutputs()
			.then(function (outputs) {
				outputs.should.have.length(6);
				outputs.forEach(function (out, i) {
					out.should.have.property('name', 'Output ' + i);
					out.should.have.property('on').and.be.false;
					out.should.have.property('enabled').and.be.true;
				});
				done();
			})
			.catch(done);

			requests.slice(1).forEach(function (req, i) {
				req.respond(200, 
					{'Content-Type': 'application/json'}, 
					'{"name":"Output ' + i + '","on":false,"enabled":true}');
			});
	});

	it('getTempValues should retrieve a list of temperatures', function (done) {
		bcs.helpers.getTempValues()
			.then(function (temps) {
				temps.should.have.length(4);
				// getTempValues converts temps by dividing by 10
				temps.should.eql([100, 101.5, 102, 103]);
				done();
			})
			.catch(done);

		requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify([1000, 1015, 1020, 1030]));
	});

	it('getTimerValues should retrieve a list of times', function (done) {
		bcs.helpers.getTimerValues()
			.then(function (timers) {
				timers.should.have.length(4);
				timers.should.eql([{"value":99685.4},{"value":99685.4},{"value":99685.4},{"value":99685.4}]);
				done();
			})
			.catch(done);

		requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify([{"value":996854},{"value":996854},{"value":996854},{"value":996854}]));
	});
	
	it('getTimerStrings should retrieve a list of times as strings', function (done) {
		bcs.helpers.getTimerStrings()
			.then(function (timers) {
				timers.should.have.length(4);
				timers.should.eql([ '27:41:25', '27:41:25', '27:41:25', '27:41:25' ]);
				done();
			})
			.catch(done);

		requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify([{"value":996854},{"value":996854},{"value":996854},{"value":996854}]));
	});

	it('getDinValues should retrieve a list of din values', function (done) {
		bcs.helpers.getDinValues()
			.then(function (dins) {
				dins.should.have.length(4);
				dins.should.eql([0, 1, 1, 0]);
				done();
			})
			.catch(done);

		requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify([0, 1, 1, 0]));
	});

	it('getOutputValues should retrieve a list of output values', function (done) {
		bcs.helpers.getOutputValues()
			.then(function (outs) {
				outs.should.have.length(6);
				outs.should.eql([0, 1, 1, 0, 1, 0]);
				done();
			})
			.catch(done);

		requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify([0, 1, 1, 0, 1, 0]));
	});

	it('getRunningProcesses should retrieve a list of running processes', function (done) {
		bcs.helpers.getRunningProcesses()
			.then(function (procs) {
				procs.should.have.length(1);
				procs[0].id.should.equal(0);
				procs[0]['current_state'].should.equal(0);
				procs[0].waiting.should.equal(false);
				procs[0].paused.should.equal(false);
				procs[0].running.should.equal(true);
				procs[0].timers.should.eql([2390889,2390889,2390889,2390889]);
				done();
			})
			.catch(done);

		requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({
			"process":[{"running":true,"paused":false,"current_state":0,"waiting":false,"timers":[2390889,2390889,2390889,2390889]},{"running":false,"paused":false,"current_state":255,"waiting":false,"timers":[0,0,0,0]},{"running":false,"paused":false,"current_state":255,"waiting":false,"timers":[0,0,0,0]},{"running":false,"paused":false,"current_state":255,"waiting":false,"timers":[0,0,0,0]},{"running":false,"paused":false,"current_state":255,"waiting":false,"timers":[0,0,0,0]},{"running":false,"paused":false,"current_state":255,"waiting":false,"timers":[0,0,0,0]},{"running":false,"paused":false,"current_state":255,"waiting":false,"timers":[0,0,0,0]},{"running":false,"paused":false,"current_state":255,"waiting":false,"timers":[0,0,0,0]}]			
		}));
	});
	
	it('getProcesses should retrieve a list of processes', function (done) {
		bcs.helpers.getProcesses()
			.then(function (processes) {
				processes.should.have.length(8);
				processes.forEach(function (proc, i) {
					proc.should.have.property('name', 'Process ' + i);
					proc.should.have.property('running').and.be.false;
					proc.should.have.property('paused').and.be.false;
					proc.should.have.property('run_on_startup').and.be.false;
					proc.should.have.property('display');
				});
				done();
			})
			.catch(done);

			requests.slice(1).forEach(function (req, i) {
				req.respond(200, 
					{'Content-Type': 'application/json'}, 
					'{"name":"Process ' + i + '","running":false,"paused":false,"run_on_startup":false,"display":0,"states":["State 0","State 1","State 2","State 3","State 4","State 5","State 6","State 7"]}');
			});
	});
	
		
});