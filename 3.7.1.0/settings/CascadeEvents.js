
//*********************************************************************************************************************
//Fields
//*********************************************************************************************************************
var TIMER_STATUS = 0
var TIMER_AFK = 1
var TIMER_ARKEN_MOVE = 2
var TIMER_ARKEN_WAIT = 3
//*********************************************************************************************************************
//End Fields
//*********************************************************************************************************************



//*********************************************************************************************************************
//Process Timer
//*********************************************************************************************************************
function ProcessTimer(timerID){
    switch (timerID) {
		case TIMER_STATUS:
			OnStatusTimer();
			break;
		case TIMER_AFK:
			OnAfkTimer();
			break;
		case TIMER_ARKEN_MOVE:
			OnArkenMoveTimer();
			break;
		case TIMER_ARKEN_WAIT:
			OnArkenWaitTimer();
			break;
		default:
			return;
	}
}
//*********************************************************************************************************************
//End Process Timer
//*********************************************************************************************************************



//*********************************************************************************************************************
//Cascaded Events
//*********************************************************************************************************************
function OnAfkTimer() {
	jmc.Send("afk");
}

//Once this function is fired, send a command to the client indicating it is time to move.
function OnArkenMoveTimer() {
	jmc.Send("lookRoom");
}

//Once this function is hit, turn itself off and re-engage the movement timer.
function OnArkenWaitTimer() {
	AutoArkenWaitTimer(false);
	AutoArkenMoveTimer(true);
}

function OnRescue(target) {
	switch (target.toLowerCase()) {
		case 'fali':
			jmc.ShowMe(target + " is not a rescuable target.", "red");
			break;
		default:
			jmc.Send("rescue " + target);
			break;
	}
}

function OnStatusTimer() {
	_isListeningForStatus = true;
	jmc.Send("score");
}
//*********************************************************************************************************************
//Cascaded Events
//*********************************************************************************************************************