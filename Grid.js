function GridWorker()
{
	// Set the default direction to North
	this.Direction = 'North';

	// Set the directionArray, Clockwise = North -> East, CounterClockwise = South -> East etc.
	this.DirectionArray = ['North','East','South','West'];

	// Since the direction is North, we shall move the second index
	this.DirectionIndex = 1;

	// Set default GridSize
	this.GridSize = [4,4];

	// Set default CallbackOnDone to null (no callback)
	this.CallbackOnDone = null;
}


GridWorker.prototype.Forward = function()
{
	// Subtract one if North or West, Add one is South or East
	return this.MoveItem(-1,1);
};

GridWorker.prototype.Backwards = function()
{
	// Ad one if North or West, Subtract one is South or East
	return this.MoveItem(1,-1);
};

GridWorker.prototype.MoveItem = function(IsTrue,IsFalse)
{
	// If direction is North or West, the active this.DirectionIndex should += IsTrue, otherwise += IsFalse;
	this.CurrentCoordinates[this.DirectionIndex] += (['North','West'].indexOf(this.Direction) > -1) ? IsTrue : IsFalse;
};

GridWorker.prototype.GetNextDirection = function(Int)
{
	// First, check the current index for this.Direction in the DirectionArray and add or subtract one
	var NextIndex = (this.DirectionArray.indexOf(this.Direction) + Int);

	// Make sure that the next index is NOT lower than 0, or hight than the highest possible array-index.
	// If the nextIndex index is lower than one, then use the last availabe direction in the array.
	// If the nextIndex is higher than the last available index, start from 0 again.
	var IndexValueConfirmed = (NextIndex >= this.DirectionArray.length ? 0 : (NextIndex < 0 ? (this.DirectionArray.length - 1) : NextIndex));

	// Get the Direction-string from the DirectionArray with the new Index.
	this.Direction = this.DirectionArray[IndexValueConfirmed];

	// If this.Direction is North or South, the secondindex should be affected, otherwise the first index.
	this.DirectionIndex = ['North','South'].indexOf(this.Direction) > -1 ? 1 : 0;
};

GridWorker.prototype.RotateClockwise = function()
{
	// Use 1 to add one from current index
	this.GetNextDirection(1)
};

GridWorker.prototype.RotateCounterClockwise = function()
{
	// Use -1 to subtract one from current index
	this.GetNextDirection(-1)
};

GridWorker.prototype.Quit = function()
{
	this.FinalCallback(this.CurrentCoordinates,this.MoveTrail);
};

GridWorker.prototype.ControlCoordinates = function(Done)
{
	var HorizontalValue = this.CurrentCoordinates[0];
	var VerticalValue = this.CurrentCoordinates[1];
	var InvalidReason = null;

	if(HorizontalValue < 0 || HorizontalValue > this.GridSize[0]) {
		InvalidReason = 'HorizontalOutOfBox';
		this.WorkArray = [];
		this.CurrentCoordinates = [-1,-1];
	} else if(VerticalValue < 0 || VerticalValue > this.GridSize[1]) {
		InvalidReason = 'VerticalOutOfBox';
		this.WorkArray = [];
		this.CurrentCoordinates = [-1,-1];
	}

	var CurrentCoordinatesString = this.CurrentCoordinates.join(',');
	var CoordinatesInvalid = this.InvalidCoordinates.indexOf(CurrentCoordinatesString);


	if(CoordinatesInvalid > -1) {
		InvalidReason = 'CoordinatesOfOutTriangle';
		this.WorkArray = [];
		this.CurrentCoordinates = [-1,-1];
	}


	return Done(InvalidReason);

};

GridWorker.prototype.Play = function(Callback)
{
	var vm = this;

	if(this.WorkArray.length === 0) {
		return;
	}

	var Index = this.WorkArray[0];
	var ExecName = this.WorkOrders[Index];

	if(ExecName in this) {
		this[ExecName]();
	}

	this.WorkArray.shift();

	this.ControlCoordinates(function(InvalidReason) {

		vm.MoveTrail.push({ Direction : vm.Direction, Coordinates : JSON.parse(JSON.stringify(vm.CurrentCoordinates)) });

		if(InvalidReason) {
			return vm.Quit(InvalidReason);
		}

		vm.Play(Callback);

	});

};

GridWorker.prototype.ParseIncomingArguments = function(arguments)
{
	this.InvalidCoordinates = [];
	var Options = Array.prototype.slice.call(arguments);

	var Type = 'Square';

	var Callback = function(FinalCoordinates,PlayHistory) {
		// We are done, printout the final coordinates.
		if(this.CallbackOnDone) {
			this.CallbackOnDone({
				FinalCoordinates : FinalCoordinates,
				PlayHistory : PlayHistory,
				GridSize : this.GridSize
			});
		} else {
			console.error('Final Coordinates: ',FinalCoordinates);
		}
	};

	// Control if incoming settings is Array..
	if(Array.isArray(Options[0])) {
		Options = Options[0];
	}

	// Control if incoming settings is JSON..
	if(typeof Options[0] == 'object' && typeof Options[0] !== null) {
		var JsonOptions = Options[0];
		Type = JsonOptions.Type || Type;
		Options = [];
		Options = Options.concat(JsonOptions.GridSize);
		Options = Options.concat(JsonOptions.StartPosition);
		Options = Options.concat(JsonOptions.Controls);
		if(JsonOptions.Callback) {
			Callback = JsonOptions.Callback;
		}
	}

	// If type is Triangle, set what coordinates that are "invalid"
	if(Type === 'Triangle')
	{
		// Get number of rows
		var Rows = Options[1];
		// Get number of columns
		var Columns = Options[0];

		// Loop all rows
		for(var i = 0; i < Rows; i++)
		{
			// On the first row, all except middle is invalid
			// On the next row, all except middle + 1 and middle - 1 is invalid, etc.
			// So, get the middle value
			var MiddleValue = Math.floor(Columns / 2);
			// All value between 0 and MiddleValue is invalid, and all values between MiddleValue and Columns is invalid
			for(var x = 0; x < Columns; x++) {
				var HighestValue = MiddleValue + i;
				var LowestValue = MiddleValue - i;

				if(x < LowestValue || x > HighestValue) {
					this.InvalidCoordinates.push(i+','+x);
				}
			}
		}
	}

	// Return it..
	return { Options : Options, Type : Type, Callback : Callback };
};

GridWorker.prototype.SetCallback = function(CallbackFunction)
{
	this.CallbackOnDone = CallbackFunction;
};

GridWorker.prototype.Start = function(Options)
{
	this.Controls = this.ParseIncomingArguments(arguments);
	this.Options = this.Controls.Options;
	this.FinalCallback = this.Controls.Callback;
	this.GridSize = [this.Options[0],this.Options[1]];
	this.CurrentCoordinates = [this.Options[2],this.Options[3]];
	this.WorkArray = this.Options.splice(4,(this.Options.length - 4));
	this.WorkOrders = ['Quit','Forward','Backwards','RotateClockwise','RotateCounterClockwise'];
	this.MoveTrail = [{ Direction : this.Direction, Coordinates : [this.Options[2],this.Options[3]] }];

	this.Play();
};

Grid = new GridWorker();