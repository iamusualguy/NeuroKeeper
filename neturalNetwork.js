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
		for (i = 0; i < 20; i++) {
			net.train(trainingSet[0],
				{
					errorThresh: 0.005,  // error threshold to reach
					iterations: 100,   // maximum training iterations
					log: true,           // console.log() progress periodically
					logPeriod: 10,       // number of iterations between logging
					//learningRate: 0.3    // learning rate
				}
			);

			let wstream = fs.createWriteStream('brain.json');
			wstream.write(JSON.stringify(net.toJSON(), null, 2));
			wstream.end();

			//var output = net.run([1, 0]);  // [0.987]
			//console.log(output);
		}
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
		net.train(trainingSet[0],
			{
				errorThresh: 0.005,  // error threshold to reach
				iterations: 10000,   // maximum training iterations
				log: true,           // console.log() progress periodically
				logPeriod: 100,       // number of iterations between logging
				//learningRate: 0.3    // learning rate
			}
		);

		let wstream = fs.createWriteStream('brain.json');
		wstream.write(JSON.stringify(net.toJSON(), null, 2));
		wstream.end();

		//var output = net.run([1, 0]);  // [0.987]
		console.log(output);
	});
}

function openNN() {
	var net = new brain.NeuralNetwork({
		activation: 'relu', // activation function
		hiddenLayers: [120, 60], // hiddenLayers: [3, 4]
		learningRate: 0.6 // общая степень обученности, полезна при обучении в несколько потоков
	});

	net.fromJSON('./brain.json');
	neuro.prepareData().then(function (trainingSet) {
		trainingSet = neuro.normilize(trainingSet);
		for (i = 0; i > trainingSet[0].lenght; i++) {
			var output = net.run(trainingSet[0][i].input);
			var res = neuro.toWords(output, trainingSet[1][i].input);
			var resNeed = neuro.toWords(trainingSet[0][i].output, trainingSet[1][i].output)
			console.log(res);
			console.log(resNeed);
		}
	});
}

module.exports = {
	createNN: createNN,
	openNN: openNN,
	createLSTN: createLSTN
}