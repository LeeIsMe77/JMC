
//*********************************************************************************************************************
//Event Registering
//*********************************************************************************************************************
jmc.RegisterHandler("Connected", "Connected()");
jmc.RegisterHandler("ConnectLost", "ConnectionLost()");
jmc.RegisterHandler("Disconnected", "Disconnected()");
jmc.RegisterHandler("Incoming", "Incoming()");
jmc.RegisterHandler("Input", "Input()");
jmc.RegisterHandler("Timer", "Timer()");
//*********************************************************************************************************************
//End Event Registering
//*********************************************************************************************************************



//*********************************************************************************************************************
//Events
//*********************************************************************************************************************
function Connected() {
    OnConnected();
};

//OnDisconnected fires when the user terminates connection to the remote host with the #ZAP command.
function Disconnected() {
    OnDisconnected();
};

//OnConnectionLost is fires when JMC loses connection to the remote host.
function ConnectionLost() {
    OnConnectionLost();
};

function Incoming() {
    OnIncoming(jmc.Event);
};

function Input() {
    OnInput(jmc.Event);
};

function Timer() {
    OnTimer(parseInt(jmc.Event));
};

//*********************************************************************************************************************
//End Events
//*********************************************************************************************************************