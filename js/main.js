var a1x, a1y, p1x, p1y, f1, td1;
var a2x, a2y, p2x, p2y, f2, td2;
var a3x, a3y, p3x, p3y, f3, td3;
var Cx, Cy, Dx, Dy, Px, Py, Ex, Ey, Fx, Fy, Gx, Gy, Hx, Hy;
var visible1 = true, visible2 = true, visible3 = true, visible4 = true;
var s = 1;
var t = 0.0, dt = 0.001;
var R = 400.0;
var Ax = 0.0, Ay = R, Bx = R, By = 0.0;
var numsteps, setnumsteps = 100000;
var diagram, diaContext, plot, plotContext;
var initial = window.setInterval(step, 1000 * dt);
var presetValue;
var scaleFactor = 4;

var rangeQuantizeFull = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87, 32.70,
	34.65, 36.71, 38.89, 41.20,	43.65, 46.25, 49.00, 51.91,	55.00, 58.27, 61.74, 65.41, 69.30, 73.42, 77.78, 82.41,
	87.31, 92.50, 98.00, 103.8, 110.0, 116.5, 123.5, 130.8, 138.6, 146.8, 155.6, 164.8, 174.6, 185.0, 196.0, 207.7,
	220.0, 233.1, 246.9, 261.6, 277.2, 293.7, 311.1, 329.6, 349.2, 370.0, 392.0, 415.3,	440.0, 466.2, 493.9, 523.3,
	554.4, 587.3, 622.3, 659.3, 698.5, 740.0, 784.0, 830.6, 880.0, 932.3, 987.8, 1047, 1109, 1175, 1245, 1319, 1397,
	1480, 1568, 1661, 1760, 1865, 1976, 2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951, 4186,
	4435, 4699, 4978, 5274, 5588, 5920, 6272, 6645, 7040, 7459, 7902];

var rangeQuantizePerfectFifths = [16.35, 24.50, 36.71, 55.00, 82.41, 123.5, 185.0, 277.2, 415.3, 622.3, 932.3,
	1397];
var rangeQuantizeMajorSixths = [19.45, 32.70, 55.00, 92.50, 155.6, 261.6, 440.0, 740.0, 1245];
var rangeQuantizeMinorThirds = [20.60, 24.50, 29.14, 34.65, 41.20, 49.00, 58.27, 69.30, 82.41, 98.00, 116.5, 138.6,
	164.8, 196.0, 233.1, 277.2, 329.6, 392.0, 466.2, 554.4, 659.3, 784.0, 932.3, 1109, 1319, 1568];

var whichScale = rangeQuantizeFull;

var drawVisual;
var source;
var started = false;
var sliderStepping = false;

var canvasVisualizer = document.getElementById("audioviz");
var visContext = canvasVisualizer.getContext("2d");

var audioContext = new AudioContext();
var gain = audioContext.createGain();
var pan = audioContext.createStereoPanner()
var osc1 = audioContext.createOscillator();
var osc2 = audioContext.createOscillator();
osc1.type = d3.select('input[name="waveform"]:checked').node().value;
osc2.type = d3.select('input[name="waveform"]:checked').node().value;
osc1.connect(gain);
osc2.connect(gain);
pan.connect(gain);

var analyser = audioContext.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;
gain.connect(analyser);
analyser.connect(audioContext.destination);

var pencolor1 = document.getElementById("pencolor1").value;
var pencolor2 = document.getElementById("pencolor2").value;
var pencolor3 = document.getElementById("pencolor3").value;

var linearScaleColor = d3.scaleLinear()
	.domain([0, 100, 1000])
	.range([pencolor1, pencolor2, pencolor3]);

var quantizedScaleFrequency = d3.scaleQuantize()
	.domain([-200, 200])
	.range(whichScale);

var powerScaleGain = d3.scalePow()
	.exponent(0.6)
	.domain([-200, 200])
	.range([0.2, 0.3]);

var linearScalePan = d3.scaleLinear()
	.domain([-200, 200])
	.range([-0.8, 0.8]);

function reset() {
	plotCanvas = document.getElementById("draw");
	plotContext = plotCanvas.getContext('2d');
	plotContext.setTransform(2.8, 0, 0, -2.8, 600, 550);
	plotContext.rotate(0.7854);
	plotContext.clearRect(-600, -500, plotCanvas.width, plotCanvas.height);
	plotContext.strokeStyle = linearScaleColor(numsteps);
	plotContext.lineWidth = 0.4;
	plotContext.globalAlpha = 0.8;
	diagramCanvas = document.getElementById("representation");
	diaContext = diagramCanvas.getContext("2d");
	diaContext.setTransform(0.25, 0, 0, -0.25, 150, 180);
	diaContext.rotate(0.7854);
	diaContext.clearRect(-560, -560, diagramCanvas.width*4, diagramCanvas.height*4);
	diaContext.lineWidth = 3;
	diaContext.globalAlpha = 0.9;
	t = 0.0;
	document.getElementById("time").value = t;
	numsteps = setnumsteps;
	sliderStepping = false;
	gain.gain.value = 0;
	inputChangeSliders();
	swingPendulums();
	visualize();
}

function showControls() {
	if (visible1) { document.getElementById("toggleable").style.visibility = "hidden"; visible1 = false;}
	else { document.getElementById("toggleable").style.visibility = "visible"; visible1 = true;}
	var elem = document.getElementById("showControls");
	if (elem.textContent=="hide controls") {
		elem.textContent = "show controls";
	}
	else {
		elem.textContent = "hide controls";
	}
}

function showTable() {
	if (visible2) { document.getElementById("info").style.visibility = "hidden"; visible2 = false;}
	else { document.getElementById("info").style.visibility = "visible"; visible2 = true;}
	var elem = document.getElementById("showTable");
	if (elem.textContent=="hide table") {
		elem.textContent = "show table";
	}
	else {
		elem.textContent = "hide table";
	}
}

function showDiagram() {
	if (visible3) { document.getElementById("diagram").style.visibility = "hidden"; visible3 = false;}
	else { document.getElementById("diagram").style.visibility = "visible"; visible3 = true;}
	var elem = document.getElementById("showDiagram");
	if (elem.textContent=="hide diagram") {
		elem.textContent = "show diagram";
	}
	else {
		elem.textContent = "hide diagram";
	}
}

function showVisualizer() {
	if (visible4) { document.getElementById("visualizer").style.visibility = "hidden"; visible4 = false;}
	else { document.getElementById("visualizer").style.visibility = "visible"; visible4 = true;}
	var elem = document.getElementById("showViz");
	if (elem.textContent=="hide visualizer") {
		elem.textContent = "show visualizer";
		document.getElementById('off').checked = true;
		setAudio();
	}
	else {
		elem.textContent = "hide visualizer";
	}
}

function speed() {
	s = s*2;
	if (s > 1024) { s = 1; };
	document.getElementById("speedmultiplier").innerHTML = "&nbsp; " + s + "x"
}

function play() {
	var elem = document.getElementById("play");
	if (initial == null) {
		sliderStepping = false;
		initial = window.setInterval(step, 1000 * dt);
		elem.textContent = "pause";
	}
	else {
		window.clearInterval(initial);
		initial = null;
		elem.textContent = "play";
		gain.gain.value = 0;
	}
}

function step() {
	plotContext.beginPath();
	plotContext.strokeStyle = linearScaleColor(t);
	if (sliderStepping == true) {
		t = parseFloat(document.getElementById("time").value);
		swingPendulums();
		//console.log(t);
		plotContext.clearRect(-600, -500, plotCanvas.width, plotCanvas.height);
		plotContext.save();
		plotContext.scale(1,-1);
		plotContext.rotate(0.7854);
		plotContext.globalAlpha = 1;
		plotContext.textAlign = "center";
		plotContext.font = "5px Arial";
		plotContext.fillStyle = linearScaleColor(t);
		plotContext.fillText("x: " + x + ", y: " + y + ", t: " + t, 140, -184);
		plotContext.restore();
		plotContext.save();
		plotContext.globalAlpha = 1;
		plotContext.fillStyle = linearScaleColor(t);
		plotContext.arc(x, y, 2.5, 0, Math.PI * 2, true);
		plotContext.fill();
		plotContext.restore();
	}
	else {
		for (var i = 0; i < s; ++i) {
			plotContext.moveTo(x, y);
			t += dt;
			document.getElementById("time").value = t;
			//console.log(t);
			swingPendulums();
			plotContext.lineTo(x, y);
		}
	}
	plotContext.stroke();
	var scaledXf1 = quantizedScaleFrequency(x);
	var scaledXf2 = quantizedScaleFrequency(x+scaleFactor);
	if (x > 170 && presetValue == "preset4") scaledXf2 = quantizedScaleFrequency(x);
	else if (x > 155.6 && presetValue == "preset3"){
		scaledXf1 = 740.0;
		scaledXf2 = 1245.0;
	}
	console.log(x, scaledXf1, scaledXf2);
	osc1.frequency.value = scaledXf1;
	osc2.frequency.value = scaledXf2;
	var scaledYg = powerScaleGain(y);
	var scaledyp = linearScalePan(y);
	pan.pan.value = scaledyp;
	gain.gain.value = scaledYg;
	diaContext.clearRect(-680, -680, 1600, 1600);
	diaContext.strokeStyle = "grey";
	diaContext.strokeRect(Ax-80,By-80,Bx-Ax+160,Ay-By+160);
	diaContext.beginPath();
	diaContext.strokeStyle = "lightgrey";
	diaContext.arc(Ax,Ay,10,0,6.2832);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.arc(Bx,By,10,0,6.2832);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.arc(Ax,By,10,0,6.2832);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.strokeStyle = "lightskyblue";
	diaContext.arc(Ex,Ey,300,0,6.2832);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.moveTo(Ax, By);
	diaContext.lineTo(Ex, Ey);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.strokeStyle = "violet";
	diaContext.arc(Fx,-Fy,50,0,6.2832);
	diaContext.moveTo(Fx, -Fy);
	diaContext.lineTo(Bx, By);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.arc(-Gx,Gy,50,0,6.2832);
	diaContext.moveTo(-Gx, Gy);
	diaContext.lineTo(Cx, Cy);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.arc(Hx,Hy,50,0,6.2832);
	diaContext.moveTo(Hx, Hy);
	diaContext.lineTo(Ax, By);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.strokeStyle = "green";
	diaContext.arc(Px,Py,10,0,6.2832);
	diaContext.stroke();
	diaContext.beginPath();
	diaContext.strokeStyle = "gold";
	diaContext.moveTo(Ax, Ay);
	diaContext.lineTo(Cx, Cy);
	diaContext.lineTo(Px, Py);
	diaContext.lineTo(Dx, Dy);
	diaContext.lineTo(Bx, By);
	diaContext.stroke();
	numsteps -= 1;
	//console.log(numsteps);
	if (numsteps <= 0) {
		window.clearInterval(initial);
		play();
		reset();
	}
}

// modified to use cos equivalent for adding rotation of pendulums and coords for diagram
// num of parameters the same as standard parametric equations
// most simple version so far adds corrections from Java and Processing attempts
function swingPendulums() {
	var x1 = a1x * Math.exp(-t / td1) * Math.sin(2.0 * Math.PI * f1 * t + p1x);
	var y1 = a1y * Math.exp(-t / td1) * Math.sin(2.0 * Math.PI * f1 * t + p1y);
	var x2 = a2x * Math.exp(-t / td2) * Math.sin(2.0 * Math.PI * f2 * t + p2x);
	var y2 = a2y * Math.exp(-t / td2) * Math.sin(2.0 * Math.PI * f2 * t + p2y);
	var x3 = a3x * Math.exp(-t / td3) * Math.sin(2.0 * Math.PI * f3 * t + p3x);
	var y3 = a3y * Math.exp(-t / td3) * Math.sin(2.0 * Math.PI * f3 * t + p3y);
	var CD = Math.sqrt(Math.pow(R + x2 - x1, 2) + Math.pow(R + y1 - y2, 2)); // circle diameter
	var gamma = Math.acos(CD / (2 * R)) - Math.acos((R + y1 - y2) / CD); // to remain within platform diameter
	Px = x1 - (R * Math.sin(gamma));
	Py = R + y1 - (R * Math.cos(gamma));
	x = Px - x3; // modified standard x1 + x2 + x3
	y = Py - y3; // modified standard y1 + y2 + y3
	Cx = x1;
	Cy = R + y1;
	Dx = R + x2;
	Dy = y2;
	Ex = x3;
	Ey = y3;
	Fx = R - x2;
	Fy = y2;
	Gx = x1;
	Gy = R - y1;
	Hx = -x3;
	Hy = -y3;
}

function read(id) {
	var input = document.getElementById(id);
	var value = input.value;
	var f = parseFloat(value);
	return f;
}

function setValue(id, value) {
	document.getElementById(id).value = value;
}

function inputChangeTable() {
	a1x = read("a1x");
	setValue("ampAx", a1x);
	a1y = read("a1y");
	setValue("ampAy", a1y);
	p1x = read("p1x") / 180.0 * Math.PI;
	setValue("phAx", read("p1x"));
	p1y = read("p1y") / 180.0 * Math.PI;
	setValue("phAy", read("p1y"));
	f1 = read("f1");
	setValue("freqA", f1);
	td1 = read("td1");
	setValue("dampA", td1);
	a2x = read("a2x");
	setValue("ampBx", a2x);
	a2y = read("a2y");
	setValue("ampBy", a2y);
	p2x = read("p2x") / 180.0 * Math.PI;
	setValue("phBx", read("p2x"));
	p2y = read("p2y") / 180.0 * Math.PI;
	setValue("phBy", read("p2y"));
	f2 = read("f2");
	setValue("freqB", f2);
	td2 = read("td2");
	setValue("dampB", td2);
	a3x = read("a3x");
	setValue("ampCx", a3x);
	a3y = read("a3y");
	setValue("ampCy", a3y);
	p3x = read("p3x") / 180.0 * Math.PI;
	setValue("phCx", read("p3x"));
	p3y = read("p3y") / 180.0 * Math.PI;
	setValue("phCy", read("p3y"));
	f3 = read("f3");
	setValue("freqC", f3);
	td3 = read("td3");
	setValue("dampC", td3);
}

function inputChangeSliders() {
	a1x = read("ampAx");
	setValue("a1x", a1x);
	a1y = read("ampAy");
	setValue("a1y", a1y);
	p1x = read("phAx") / 180.0 * Math.PI;
	setValue("p1x", read("phAx"));
	p1y = read("phAy") / 180.0 * Math.PI;
	setValue("p1y", read("phAy"));
	f1 = read("freqA");
	setValue("f1", f1);
	td1 = read("dampA");
	setValue("td1", td1);
	a2x = read("ampBx");
	setValue("a2x", a2x);
	a2y = read("ampBy");
	setValue("a2y", a2y);
	p2x = read("phBx") / 180.0 * Math.PI;
	setValue("p2x", read("phBx"));
	p2y = read("phBy") / 180.0 * Math.PI;
	setValue("p2y", read("phBy"));
	f2 = read("freqB");
	setValue("f2", f2);
	td2 = read("dampB");
	setValue("td2", td2);
	a3x = read("ampCx");
	setValue("a3x", a3x);
	a3y = read("ampCy");
	setValue("a3y", a3y);
	p3x = read("phCx") / 180.0 * Math.PI;
	setValue("p3x", read("phCx"));
	p3y = read("phCy") / 180.0 * Math.PI;
	setValue("p3y", read("phCy"));
	f3 = read("freqC");
	setValue("f3", f3);
	td3 = read("dampC");
	setValue("td3", td3);
	quantizedScaleFrequency = d3.scaleQuantize()
		.domain([-200, 200])
		.range(whichScale);
	pencolor1 = document.getElementById("pencolor1").value;
	pencolor2 = document.getElementById("pencolor2").value;
	pencolor3 = document.getElementById("pencolor3").value;
	linearScaleColor = d3.scaleLinear()
		.domain([0, 100, 1000])
		.range([pencolor1, pencolor2, pencolor3]);
}

function add_one(id) {
	document.getElementById(id).value = parseFloat(document.getElementById(id).value) + 1;
	inputChangeSliders();
}

function subtract_one(id) {
	document.getElementById(id).value = parseFloat(document.getElementById(id).value) - 1;
	inputChangeSliders();
}

function add_oneF(id) {
	document.getElementById(id).value = parseFloat(document.getElementById(id).value) + 0.01;
	inputChangeSliders();
}

function subtract_oneF(id) {
	document.getElementById(id).value = parseFloat(document.getElementById(id).value) - 0.01;
	inputChangeSliders();
}

function selectWaveform() {
	document.getElementById('off').checked = true;
	osc1.type = d3.select('input[name="waveform"]:checked').node().value;
	osc2.type = d3.select('input[name="waveform"]:checked').node().value;
	setAudio();
}

function setAudio() {
	if (d3.select('input[name="setaudio"]:checked').node().value == "on") {
		if (started == false) {
			started = true;
			osc1.start();
			osc2.start();
			gain.connect(analyser);
		}
		else gain.connect(analyser);
	}
	else if (d3.select('input[name="setaudio"]:checked').node().value == "off") gain.disconnect(analyser);
}

function visualize() {
	WIDTH = canvasVisualizer.width;
	HEIGHT = canvasVisualizer.height;

	analyser.fftSize = 2048;
	var bufferLength = analyser.fftSize;
	console.log(bufferLength);
	var dataArray = new Uint8Array(bufferLength);

	visContext.clearRect(0, 0, WIDTH, HEIGHT);

	var draw = function () {

		drawVisual = requestAnimationFrame(draw);

		analyser.getByteFrequencyData(dataArray);

		visContext.clearRect(0, 0, WIDTH, HEIGHT);

		visContext.lineWidth = 1;
		visContext.strokeStyle = "gold";

		visContext.beginPath();

		var sliceWidth = WIDTH * Math.PI / bufferLength;
		var x = 0;

		for (var i = 0; i < bufferLength; i++) {
			var v = dataArray[i] / 128.0;
			var y = v * HEIGHT / 2;

			if (i === 0) {
				visContext.moveTo(x, y);
			} else {
				visContext.lineTo(x, y);
			}

			x += sliceWidth;
		}

		visContext.lineTo(canvasVisualizer.width, canvasVisualizer.height / 2);
		visContext.stroke();
	};

	draw();
}

function timeStep() {
	sliderStepping = true;
	var elem = document.getElementById("play");
	window.clearInterval(initial);
	initial = null;
	elem.textContent = "play";
	step();
}

function presets(value) {
	presetValue = value;
	if (value == "preset1") {
		setValue("phAx", 180);
		setValue("phAy", 180);
		setValue("phBx", 180);
		setValue("phBy", 180);
		setValue("phCx", 171);
		setValue("phCy", 171);
		setValue("dampA", 250);
		setValue("dampB", 250);
		setValue("dampC", 250);
		setValue("freqA", 0.6);
		setValue("freqB", 0.6);
		setValue("freqC", 0.5);
		whichScale = rangeQuantizeMinorThirds;
		scaleFactor = 30;
		reset();
	}
	else if (value == "preset2") {
		setValue("phAx", 90);
		setValue("phAy", 6);
		setValue("phBx", 90);
		setValue("phBy", 6);
		setValue("phCx", 90);
		setValue("phCy", 6);
		setValue("dampA", 250);
		setValue("dampB", 250);
		setValue("dampC", 250);
		setValue("freqA", 0.3);
		setValue("freqB", 0.3);
		setValue("freqC", 0.2);
		whichScale = rangeQuantizePerfectFifths;
		scaleFactor = 33;
		reset();
	}
	else if (value == "preset3") {
		setValue("phAx", 0);
		setValue("phAy", 0);
		setValue("phBx", 0);
		setValue("phBy", 0);
		setValue("phCx", 0);
		setValue("phCy", 0);
		setValue("dampA", 180);
		setValue("dampB", 180);
		setValue("dampC", 400);
		setValue("freqA", 0.5);
		setValue("freqB", 0.5);
		setValue("freqC", 0.3);
		whichScale = rangeQuantizeMajorSixths;
		scaleFactor = 45;
		reset();
	}
	else if (value == "preset4") {
		setValue("phAx", 90);
		setValue("phAy", 90);
		setValue("phBx", 90);
		setValue("phBy", 90);
		setValue("phCx", 79);
		setValue("phCy", 79);
		setValue("dampA", 250);
		setValue("dampB", 250);
		setValue("dampC", 300);
		setValue("freqA", 0.4);
		setValue("freqB", 0.4);
		setValue("freqC", 0.2);
		whichScale = rangeQuantizeFull;
		scaleFactor = 30;
		reset();
	}
	else {
		setValue("phAx", 180);
		setValue("phAy", 180);
		setValue("phBx", 180);
		setValue("phBy", 180);
		setValue("phCx", 90);
		setValue("phCy", 90);
		setValue("dampA", 200);
		setValue("dampB", 200);
		setValue("dampC", 100);
		setValue("freqA", 1);
		setValue("freqB", 0.99);
		setValue("freqC", 1);
		whichScale = rangeQuantizeFull;
		scaleFactor = 4;
		reset();
	}
}
