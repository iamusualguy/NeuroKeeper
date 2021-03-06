const fs = require('fs');
var brain = require('brain.js');
const neuro = require("./scripts/neuro.js");

function createNN() {
	var net = new brain.NeuralNetwork({
		activation: 'relu', // activation function
		hiddenLayers: [180, 120, 60, 40], // hiddenLayers: [3, 4]
		learningRate: 0.6 // общая степень обученности, полезна при обучении в несколько потоков
	});

	neuro.prepareData().then(function (trainingSet) {
		trainingSet = neuro.normilize(trainingSet);
		//for (i = 0; i < 20; i++) {
		net.train(trainingSet[0], {
			errorThresh: 0.005, // error threshold to reach
			iterations: 100, // maximum training iterations
			log: true, // console.log() progress periodically
			logPeriod: 10, // number of iterations between logging
			//learningRate: 0.3    // learning rate
		});

		let wstream = fs.createWriteStream('brain.json');
		wstream.write(JSON.stringify(net.toJSON(), null, 2));
		wstream.end();

		//var output = net.run([1, 0]);  // [0.987]
		//console.log(output);
		//}
	});
}

function createLSTN() {

	var net = new brain.recurrent.LSTM({
		activation: 'leaky-relu', // activation function
		hiddenLayers: [180, 120, 60, 40], // hiddenLayers: [3, 4]
		learningRate: 0.6 // общая степень обученности, полезна при обучении в несколько потоков
	});


	neuro.prepareData().then(function (trainingSet) {
		trainingSet = neuro.normilize(trainingSet);
		net.train(trainingSet[0], {
			errorThresh: 0.005, // error threshold to reach
			iterations: 10000, // maximum training iterations
			log: true, // console.log() progress periodically
			logPeriod: 100, // number of iterations between logging
			//learningRate: 0.3    // learning rate
		});

		let wstream = fs.createWriteStream('brain.json');
		wstream.write(JSON.stringify(net.toJSON(), null, 2));
		wstream.end();

		//var output = net.run([1, 0]);  // [0.987]
		console.log(output);
	});
}

function openNN(i) {
	var net = new brain.NeuralNetwork(); //{
	//activation: 'relu', // activation function
	//hiddenLayers: [120, 60], // hiddenLayers: [3, 4]
	//learningRate: 0.6 // общая степень обученности, полезна при обучении в несколько потоков
	//});

	return net.fromJSON(require('./' + i + '.json'));
}

function getNextString() {
	return neuro.gI().then((inputData) => {
		console.log(inputData);
		inputData = neuro.normilize(inputData);
		var net = openNN(getRandomInt(1, 3));
		//for (i = 0; i > trainingSet[0].lenght; i++) {
		var output = net.run(inputData[0][0].input);
		var res = neuro.toWords(output, inputData[1][0].input);
		//var resNeed = neuro.toWords(inputData[0][i].output, inputData[1][i].output)
		console.log(res);
		//console.log(resNeed);
		//	}
		res = res.filter((v, i, a) => a.indexOf(v) === i)

		res = res.slice(getRandomInt(1, 8), getRandomInt(13, 25));
		console.log(res);
		return res.join(" ");
	});
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
	createNN: createNN,
	openNN: openNN,
	createLSTN: createLSTN,
	getNextString: getNextString
}