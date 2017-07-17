jmc.Parse("#use {AfkTimer.js}");
jmc.Parse("#use {ArkenTimer.js}");
jmc.Parse("#use {GroupManagement.js}");
jmc.RegisterHandler("Connected", "OnConnected()")
jmc.RegisterHandler("Input", "OnInput()")
jmc.RegisterHandler("Incoming", "OnIncoming()")
jmc.RegisterHandler("Timer", "OnTimer()");

// var TIMER_STATUS = 0
var TIMER_AFK = 1
var TIMER_ARKEN_MOVE = 2
var TIMER_ARKEN_WAIT = 3

function OnConnected(){ }

function OnIncoming(){
    var incomingLine = jmc.Event;

    //Perform a regex test on the incoming line to verify it is a score line...
    var matches = incomingLine.match(new RegExp("You have ([0-9]+)/([0-9]+) hit, ([0-9]+)/([0-9]+) stamina, ([0-9]+)/([0-9]+) moves, ([0-9]+) spirit."));
    // if (matches.length == 1){
    //     AddMember(matches[0].split("-- ")[1]);
    // }
    if (matches !== null && matches.length >= 0){
        //..and if it is, process the score line.
        SetCharacterStatus(matches[0]);
    }
    
    // if (_isListeningForStatus){
    //     //var fightingStatisticsRegex = new RegExp("OB: (.)+, DB: (.)+, PB: (.)+, Speed: (.)+, Gold: (.)+, XP Needed: (.)+.")
    //     if (abortExpression.test(incomingLine)){
    //         _isListeningForStatus = false;
    //     }
    //     jmc.DropEvent();
    // }

    if (_isListeningForGroup){
        // if (abortExpression.test(incomingLine)){
        //     _isListeningForGroup = false;
        // }
        if (incomingLine == "" || new RegExp("(.)+>").test(incomingLine)){
            _isListeningForGroup = false;
        }
        // if (incomingLine == null || incomingLine.replace(" ", "") == "" || incomingLine.replace(" ", "") == ">"){
        //     _isListeningForGroup = false;
        // }
        else{
            var groupLineRegex = new RegExp("HP:(.)+S:(.)+ MV:(.)+ -- (.)+")
            if (groupLineRegex.test(incomingLine)){
                AddMember(incomingLine.split("-- ")[1]);
            }
        }
        jmc.DropEvent();
    }
}

function OnInput(){ }

function OnTimer(){ 
    switch (parseInt(jmc.Event)){
        // case TIMER_STATUS:
        //     OnUpdateStatus();
        //     break;
        case TIMER_AFK:
            OnAfk();
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

var _isListeningForGroup = false;
// var _isListeningForStatus = false;

function InitializeGroup(){
    _isListeningForGroup = true;
    ClearGroup();
    jmc.Send("group");
}

// function BeginUpdateStatus(){
//     _isListeningForStatus = true;
//     jmc.Send("score");    
// }

// function AutoStatus(enabled){
//     if (enabled){
//         jmc.SetTimer(TIMER_STATUS, 50);
//         jmc.ShowMe("Auto status is on", "green");
//     }
//     else{    
//         jmc.KillTimer(TIMER_STATUS);
//         jmc.ShowMe("Auto status is off", "red");
//     }
// }

function SetCharacterStatus(incomingLine){
    var splitLine = incomingLine.split(" ");
    WriteToStatusWindow("HP", splitLine[2], 1);
    WriteToStatusWindow("MP", splitLine[4], 2);
    WriteToStatusWindow("MV", splitLine[6], 3);
}

function WriteToStatusWindow(name, fraction, statusWindow){
    var splitFraction = fraction.split("/");
    var percentage = (parseFloat(splitFraction[0]) / parseFloat(splitFraction[1])) * 100.00;

    var message = name + ": " + fraction;
    if (percentage >= 75){
        jmc.SetStatus(statusWindow, message, "green");
    }
    else if (percentage >= 40){
        jmc.SetStatus(statusWindow, message, "yellow");
    }
    else{
        jmc.SetStatus(statusWindow, message, "light red");
    }
}

