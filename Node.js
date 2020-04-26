global.Grid;

require('./Grid.js');

Grid.SetCallback(function(Result) {
	console.error(Result.FinalCoordinates);
});

Grid.Start(process.argv[2].split(',').map(function (x) { return parseInt(x, 10); }));