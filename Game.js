function GamePlay() {
	this.InitGame(true);
	this.CatchKeyboad();
}

// Set default GameVersion to "Programmatic"
GamePlay.prototype.GameVersion = 'Programmatic';


GamePlay.prototype.InitGame = function (InfoBox) {
	var Body = document.getElementsByTagName("BODY")[0];

	Grid = new GridWorker();

	Grid.SetCallback(function (Result) {

		Game.Playback(Result.PlayHistory);

	});

	if (document.getElementById('game-controls')) {
		document.getElementById('game-controls').innerHTML = '';
		document.getElementById('game-wrapper').innerHTML = '';
		document.getElementById('game-info').innerHTML = '';
	} else {
		Body.innerHTML += '<div id="game-controls"></div>';
		Body.innerHTML += '<div id="game-wrapper"></div>';
		Body.innerHTML += '<div id="game-overlay"></div>';
		Body.innerHTML += '<div id="game-info"></div>';
	}


	// Set initial Welcome
	if (InfoBox) {
		Body.classList = 'game-loaded';
		this.SetText('game-state-value-play-loaded', 'Welcome!', 'Your goal is to drive the car from the initial position, to the house.' + "\r\n\r\n" + '* Arrow up moves the car forward.' + "\r\n" + '* Arrow down moves the car backwards.' + "\r\n" + '* Arrow right rotates the direction clockwise.' + "\r\n" + '* Arrow left rotates the direction counterclockwise.' + "\r\n" + '* ENTER starts the car.' + "\r\n\r\n" + 'If you have not reached the house, you can continue driving the car again, until you reach the house, or drive in to a tree.', ['play', 'playEasy']);
	} else {
		Body.classList = 'gameplay-initiated';
	}


	this.WindowWidth = parseInt(document.getElementById("game-wrapper").offsetWidth);
	this.WindowHeight = parseInt(document.getElementById("game-wrapper").offsetHeight);

	this.CellWidth = 50;
	this.CellHeight = 50;
	this.ColumnCount = Math.floor(this.WindowWidth / this.CellWidth);
	this.RowCount = Math.floor(this.WindowHeight / this.CellHeight);
	this.InvalidGridCoordinates = [];
	this.ControlQue = [];
	this.PlaceCells();

	this.SetGrid([-1, -1]);
	this.RandomizeStartingGrid();
	this.RandomizeGoalGrid();
	this.RandomizeInvalidGridAreas(50);
};

GamePlay.prototype.RunButton = function (Id) {

	if (Id === 'play') {
		this.GameVersion = 'Programmatic';
		document.getElementsByTagName("BODY")[0].classList = 'gameplay-initiated';
	}

	if (Id === 'playEasy') {
		this.GameVersion = 'Easy';
		document.getElementsByTagName("BODY")[0].classList = 'gameplay-initiated';
	}

	if (Id === 'replay') {
		this.GameVersion = 'Programmatic';
		this.InitGame(false);
	}

	if (Id === 'replayEasy') {
		this.GameVersion = 'Easy';
		this.InitGame(false);
	}

};

GamePlay.prototype.SetText = function (Id, Title, Text, Buttons, Image) {
	document.getElementById("game-info").innerHTML = '';
	document.getElementById("game-info").classList = Id;
	if (Image) {
		document.getElementById("game-info").innerHTML += '<div id="game-info-image"></div>';
	}
	document.getElementById("game-info").innerHTML += '<h1>' + Title + '</h1>';
	document.getElementById("game-info").innerHTML += '<p>' + Text + '</p>';
	document.getElementById("game-info").innerHTML += '<div id="game-info-buttons"></div>';

	Buttons.forEach(function (Button) {
		var ButtonTitle = Button === 'play' ? 'Start Programmatic' : (Button === 'playEasy' ? 'Start Easy-play' : 'Start Programmatic');
		document.getElementById("game-info").innerHTML += '<button onclick="Game.RunButton(\'' + Button + '\');">' + ButtonTitle + '</button>';

		if (Button === 'replay') {
			document.getElementById("game-info").innerHTML += '<button onclick="Game.RunButton(\'replayEasy\');">Start Easy-Play</button>';
		}
	})
};

GamePlay.prototype.RandomizeInvalidGridAreas = function (Count) {
	for (var i = 0; i < Count; i++) {
		var Col = this.RandomValue(1, this.ColumnCount);
		var Row = this.RandomValue(1, this.RowCount);

		if (this.GoalGrid.join('_') != [Col, Row].join('_') && this.StartingGrid.join('_') != [Col, Row].join('_')) {
			this.InvalidGridCoordinates.push([Col, Row].join('_'));
		}

	}

	// Place them
	this.InvalidGridCoordinates.forEach(function (CoordString) {
		if (document.getElementById("gamecell_" + CoordString)) {
			document.getElementById("gamecell_" + CoordString).classList.add('gameInvalid')
		}
	})

};

GamePlay.prototype.CatchKeyboad = function () {

	var vm = this;
	document.getElementById('game-controls').innerHTML = '';

	document.addEventListener("keydown", function (event) {

		var ReplacementKeys = {
			38: 1,
			40: 2,
			37: 4,
			39: 3,
			13: 0
		};

		if (event.keyCode in ReplacementKeys) {

			vm.ControlQue.push(ReplacementKeys[event.keyCode]);

			document.getElementById('game-controls').innerHTML += '<span class="control-selected control-' + ReplacementKeys[event.keyCode] + '"></span>';

			if (event.keyCode === 13 || vm.GameVersion === 'Easy') {

				if (vm.GameVersion === 'Easy') {
					vm.ControlQue.push(0);
				}

				Grid.Start({
					GridSize: vm.GridSize,
					StartPosition: vm.StartingGrid,
					Controls: vm.ControlQue
				})

			}
		}

	});
};

GamePlay.prototype.RandomValue = function (min, max) {
	return parseInt(Math.random() * (max - min) + min);
};

GamePlay.prototype.SetGrid = function (GridSize) {

	// Remove all current
	Array.prototype.forEach.call(document.getElementsByClassName("gameActive"), function (el) {

		// Do stuff here
		el.classList.remove('gameActive');
		el.classList.remove('gameActiveFirstRow');
		el.classList.remove('gameActiveFirstCol');

	});

	this.PlaceCells();

	this.ActivateGameplaceCells((GridSize[0] < 0 ? this.RowCount : GridSize[0]), (GridSize[1] < 0 ? this.ColumnCount : GridSize[1]));

};

GamePlay.prototype.RandomizeStartingGrid = function () {

	this.StartingGrid = [this.RandomValue(1, this.ColumnCount), this.RandomValue(1, this.RowCount)];

	var ElementArray = document.getElementsByClassName('game-pixel-' + this.StartingGrid.join('_'));

	if (ElementArray.length > 0) {
		ElementArray[0].classList.add('play-active');
	}

};

GamePlay.prototype.RandomizeGoalGrid = function () {

	this.GoalGrid = [this.RandomValue(0, this.ColumnCount), this.RandomValue(0, this.RowCount)];

	var ElementArray = document.getElementsByClassName('game-pixel-' + this.GoalGrid.join('_'));

	if (ElementArray.length > 0) {
		ElementArray[0].classList.add('play-goal');
	}

};

GamePlay.prototype.SetCurrentState = function (State, Element, Direction, Coordinates) {

	var Body = document.getElementsByTagName("BODY")[0];

	// Remove old-class
	Body.classList.remove('body-play-active');
	Body.classList.remove('body-play-completed');
	Body.classList.remove('body-play-failed');
	Body.classList.remove('body-car-killed');
	Body.classList.remove('body-direction-North');
	Body.classList.remove('body-direction-East');
	Body.classList.remove('body-direction-South');
	Body.classList.remove('body-direction-West');
	Body.classList.remove('game-loaded');

	// Is there any current elements with this State?
	if (document.getElementsByClassName(State).length > 0) {
		document.getElementsByClassName(State)[0].classList.remove(State);
	}

	// Add new class to element
	// Only if Element is sent
	if (Element) {
		Element.classList.add(State);
	}

	// Add new class
	Body.classList.add('body-' + State);
	Body.classList.add('body-direction-' + Direction);

	if (State === 'play-completed') {
		this.SetText('game-state-value-play-completed', 'Congratulations!', 'You are a true master when it comes to driving cars, and the same time finding a house. Not bad!', ['replay'], true);
		Body.classList.remove('gameplay-initiated');
	}

	if (State === 'play-failed') {
		this.ControlQue = [];
		document.getElementById('game-controls').innerHTML = '';
		this.StartingGrid = JSON.parse(JSON.stringify(Coordinates));
	}

	if (State === 'car-killed') {
		this.SetText('game-state-value-play-car-killed', 'You hit a tree..', 'Maybe the sun was in the way, or it was too dark, but you ran in to a tree. Hope it did not hurt to much.. :(', ['replay'], true);
		Body.classList.remove('gameplay-initiated');
	}

	if (State === 'play-out-of-grid') {
		this.SetText('game-state-value-play-out-of-grid', 'You fell of the world!', 'Sorry, you drove of the end of the world.', ['replay'], true);
		Body.classList.remove('gameplay-initiated');
	}
};

GamePlay.prototype.Playback = function (Array) {

	if (Array.length === 0) {
		return;
	}

	var ArrayIndex = Array[0];
	var Index = ArrayIndex.Coordinates;
	var vm = this;
	var ElementArray = document.getElementsByClassName('game-pixel-' + Index.join('_'));

	if (ElementArray.length === 0) {

		vm.SetCurrentState('play-out-of-grid', null, ArrayIndex.Direction, Index);
		return;

	}

	if (this.InvalidGridCoordinates.indexOf(Index.join('_')) > -1) {

		vm.SetCurrentState('car-killed', ElementArray[0], ArrayIndex.Direction, Index);
		return;

	}

	vm.SetCurrentState('play-active', ElementArray[0], ArrayIndex.Direction, Index);

	setTimeout(function () {

		Array.shift();

		if (Array.length === 0) {

			vm.SetCurrentState((Index.join('_') != vm.GoalGrid.join('_') ? 'play-failed' : 'play-completed'), ElementArray[0], ArrayIndex.Direction, Index);

		} else {

			vm.Playback(Array);

		}


	}, (vm.GameVersion === 'Easy' ? 0 : 100));

};

GamePlay.prototype.PlaceCells = function () {
	document.getElementById("game-wrapper").innerHTML = '';
	// Place rows
	for (var r = 0; r < this.RowCount; r++) {
		document.getElementById("game-wrapper").innerHTML += '<div class="gamerow" id="gamerow_' + r + '" style="height: ' + this.CellHeight + 'px"></div>';
		// In each row, place cells
		for (var c = 0; c < this.ColumnCount; c++) {
			document.getElementById("gamerow_" + r).innerHTML += '<div class="gamecell" style="width: ' + (this.CellWidth - 2) + 'px; height: ' + (this.CellHeight - 2) + 'px" id="gamecell_' + c + '_' + r + '"></div>';
		}
	}
};

GamePlay.prototype.BuildColumnActiveArray = function (Count) {
	var MiddleValue = Math.floor(this.ColumnCount / 2);
	var EvenValue = Count % 2 === 0;
	var CountLeft = Math.floor(!EvenValue ? (Count - 1) / 2 : ((Count - 1) / 2 + 1));
	var CountRight = Math.floor((Count - 1) / 2);
	var ValueLeft = Math.floor(MiddleValue - CountLeft);
	var ValueRight = Math.floor(MiddleValue + CountRight);
	return {High: ValueRight, Low: ValueLeft};
};

GamePlay.prototype.BuildRowActiveArray = function (Count) {
	var MiddleValue = Math.floor(this.RowCount / 2);
	var EvenValue = Count % 2 === 0;
	var CountLeft = Math.floor(!EvenValue ? (Count - 1) / 2 : ((Count - 1) / 2 + 1));
	var CountRight = Math.floor((Count - 1) / 2);
	var ValueLeft = MiddleValue - CountLeft;
	var ValueRight = MiddleValue + CountRight;
	return {High: Math.floor(ValueRight), Low: Math.floor(ValueLeft)};
};

GamePlay.prototype.ActivateGameplaceCells = function (Vertical, Horizontal) {
	this.GridSize = [Horizontal, Vertical];
	var ColumnRules = this.BuildColumnActiveArray(Horizontal);
	var RowRules = this.BuildRowActiveArray(Vertical);
	var RowInt = 0;

	for (var r = RowRules.Low; r <= RowRules.High; r++) {

		var ColInt = 0;

		for (var c = ColumnRules.Low; c <= ColumnRules.High; c++) {
			document.getElementById("gamecell_" + c + "_" + r).classList.add('gameActive');
			if (r === RowRules.Low) {
				document.getElementById("gamecell_" + c + "_" + r).classList.add('gameActiveFirstRow');
			}
			if (c === ColumnRules.Low) {
				document.getElementById("gamecell_" + c + "_" + r).classList.add('gameActiveFirstCol');
			}

			document.getElementById("gamecell_" + c + "_" + r).classList.add('game-pixel-' + ColInt + '_' + RowInt);
			ColInt++;
		}
		RowInt++;
	}
};

Game = new GamePlay();