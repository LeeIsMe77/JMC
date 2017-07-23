
//*********************************************************************************************************************
//Event Registering
//*********************************************************************************************************************
jmc.RegisterHandler("Connected", "OnConnected()")
jmc.RegisterHandler("Input", "OnInput()")
jmc.RegisterHandler("Incoming", "OnIncoming()")
jmc.RegisterHandler("Timer", "OnTimer()");
//*********************************************************************************************************************
//End Event Registering
//*********************************************************************************************************************



//*********************************************************************************************************************
//Events
//*********************************************************************************************************************
function OnConnected() {
	//Note: Not currently utilized.    
}

function OnIncoming() {
	var incomingLine = jmc.Event;
	ParseForStatus(incomingLine);
	ParseForMapLine(incomingLine);
	ParseForGroupLine(incomingLine);
	ParseForMutilate(incomingLine);
	ParseForExitLine(incomingLine);
	//ParseForSkill(incomingLine);

}

function OnInput() {
	//Note: Not currently utilized.    
}

function OnTimer() {
	ProcessTimer(parseInt(jmc.Event));	
}
//*********************************************************************************************************************
//End Events
//*********************************************************************************************************************


