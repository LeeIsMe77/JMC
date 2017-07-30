//*********** Begin Event Wiring **********/
jmc.RegisterHandler("Connected", "OnConnected()")
jmc.RegisterHandler("Input", "OnInput()")
jmc.RegisterHandler("Incoming", "OnIncoming()")
jmc.RegisterHandler("Timer", "OnTimer()");
//*********** End Event Wiring ************/

//*********** Begin Fields ****************/
var _group = new GroupMemberCollection();
var _isListeningForGroup = false;
var _isListeningForStatus = false;
var _isMapping = false;

var TIMER_STATUS = 0
var TIMER_AFK = 1
var TIMER_ARKEN_MOVE = 2
var TIMER_ARKEN_WAIT = 3
//*********** End Fields ******************/



//NOTE: These are events which are wired to Jaba Mud Client events.  There are several more, though these are the ones I currently find useful.

//*********** Begin Events ****************/
function OnConnected(){ 
    //Note: Not currently utilized.    
}

function OnIncoming(){
    var incomingLine = jmc.Event;
    var abortExpression = new RegExp("(.)+>");

    //Perform a regex test on the incoming line to verify it is a score line...
    var matches = incomingLine.match(new RegExp("You have ([0-9]+)/([0-9]+) hit, ([0-9]+)/([0-9]+) stamina, ([0-9]+)/([0-9]+) moves, ([0-9]+) spirit."));
    if (matches !== null && matches.length > 0){
        //..and if it is, process the score line.
        SetCharacterStatus(matches[0]);
    }

    if (_isMapping){
        matches = incomingLine.match(new RegExp("[( .+-|V)]+"));
        if (matches !== null && matches.length > 0){
            jmc.Parse("#woutput {0}{" + matches[0] + "}");
            jmc.DropEvent();
            return;
        }    
        if (incomingLine == "" || abortExpression.test(incomingLine)){
            _isMapping = false;
        }
    }

    if (_isListeningForStatus){
        if (incomingLine == "" || abortExpression.test(incomingLine)){
            _isListeningForStatus = false;
        }
        jmc.DropEvent();
    }

    if (_isListeningForGroup){
        ParseForGroupLine(incomingLine);
    }

    if (_group.Count() > 0){
        ParseForMutilate(incomingLine);
    }

}

function ParseForGroupLine(incomingLine){
    if (incomingLine == "" || new RegExp("(.)+>").test(incomingLine)){
        _isListeningForGroup = false;
    }
    else{
        var matches =incomingLine.match(new RegExp("HP:(.)+S:(.)+ MV:(.)+ -- (.)+"));
        if (matches !== null && matches.length > 0){
            var memberNameArray = matches[0].split("-- ");
            if (memberNameArray !== null && memberNameArray.length == 2){
                var memberName = memberNameArray[1];                    
                var cleanName = CleanName(memberName);
                if (cleanName !== "") {
                    if (_group.IndexOf(cleanName) === -1){
                        _group.Add(cleanName, memberName.indexOf(" (Head of group)") !== -1);
                    }
                }
            }
        }        
        jmc.DropEvent();
    }
}

function ParseForMutilate(incomingLine){
    var memberName = "";
    
    var memberMutRegEx = incomingLine.match(new RegExp("([a-zA-Z]+) (MUTILATE)(.)+ with (his|her|its) deadly (.)+!!"));
    if (memberMutRegEx !== null && memberMutRegEx.length > 1){
        memberName = memberMutRegEx[1];            
    }
    else {        
        var meMutRegEx = incomingLine.match(new RegExp("(.)*You MUTILATE (.)+ with your deadly (.)+!!"));
        if (meMutRegEx !== null && meMutRegEx.length > 0){            
            memberName = jmc.GetVar("me");
            jmc.ShowMe("Value of me: " + memberName);
        }
    }
    if (memberName == "" || _group.IndexOf(memberName) == -1){
        return;
    }
    
    jmc.ShowMe("Mutilate registered by: " + memberName);
    _group.IncrementMutilateCount(memberName);
}

function OnInput(){ 
    //Note: Not currently utilized.    
}

function OnTimer(){ 
    switch (parseInt(jmc.Event)){
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
//*********** End Events ******************/

//*********** Begin Cascaded Events *******/
function OnAfkTimer(){
    jmc.Send("afk");
}

//Once this function is fired, send a command to the client indicating it is time to move.
function OnArkenMoveTimer(){
    jmc.Parse("lookRoom");
}

//Once this function is hit, turn itself off and re-engage the movement timer.
function OnArkenWaitTimer(){
    AutoArkenWaitTimer(false);
    AutoArkenMoveTimer(true);
}

function OnRescue(target){
    switch (target.toLowerCase()){
        case 'fali':
            jmc.ShowMe(target + " is not a rescuable target.", "red");
            break;
        default:
            jmc.Send("rescue " + target);
            break;
    }
}

function OnStatusTimer(){
    _isListeningForStatus = true;
    jmc.Parse("score");
}
//*********** End Cascaded Events *********/




//NOTE: These are public use functions which are meant to be utilized by calls from Jaba Mud Client.

//*********** Begin Functions *************/

//*********** Begin Mapping ***************/
function Map(mapName){
    _isMapping = true;
    jmc.Parse("#woutput {0}{ }");
    jmc.Parse("#woutput {0}{Red}{" + mapName.toTitleCase() + " Map:}");
    jmc.Send("exa " + mapName);
}
//*********** End Mapping *****************/

//*********** Begin Toggles ***************/
function AutoAfk(isEnabled){
    if (isEnabled){
        jmc.SetTimer(TIMER_AFK, 150);
        jmc.ShowMe("Auto AFK is on", "green");
    }
    else{    
        jmc.KillTimer(1);
        jmc.ShowMe("Auto AFK is off", "red");
    }
}

function AutoArkenMoveTimer(isEnabled){
    if (isEnabled){
        jmc.SetTimer(TIMER_ARKEN_MOVE, 50);
    }
    else{    
        jmc.KillTimer(TIMER_ARKEN_MOVE);
    } 
}

function AutoArkenWaitTimer(isEnabled){
    if (isEnabled){
        jmc.SetTimer(TIMER_ARKEN_WAIT, 1500);
    }
    else{    
        jmc.KillTimer(TIMER_ARKEN_WAIT);
    }  
}

function AutoRescue(isEnabled){
    //Remove the action just in case it already exists...
    jmc.Parse("#unaction {%0 turns to fight %1!}{#script OnRescue(%0)}");
    if (isEnabled){
        jmc.Parse("#action {%0 turns to fight %1!}{#script OnRescue(%0)}");
        jmc.ShowMe("Rescue trigger is on.", "green");
    }
    else{
        jmc.ShowMe("Rescue trigger is off.", "red");
    }
}

function AutoStatus(isEnabled){
    if (isEnabled){
        jmc.SetTimer(TIMER_STATUS, 200);
        jmc.ShowMe("Auto status is on", "green");
    }
    else{    
        jmc.KillTimer(TIMER_STATUS);
        jmc.ShowMe("Auto status is off", "red");
    }
}
//*********** End Toggles *****************/

//*********** Begin Group Commands ********/

function InitializeGroup(){
    _isListeningForGroup = true;
    //TODO: Implement method to "Update" group without clearing.
    _group.Clear();
    jmc.Send("group");
}

function HealGroup(healingSpells, leaderOnly){
    if (healingSpells == null || healingSpells.length == 0){
        //If no healing spells provided, set a default set of healing spells to be cast.
        healingSpells = ["regeneration", "vitality", "curing", "insight"];
    }
    for (var index = 0; index < _group.length; index++){
        var currentMember = _group[index];
        if (leaderOnly && !currentMember.IsLeader) continue;
        jmc.ShowMe("Healing " + currentMember.Name);        
        for (var spellIndex = 0; spellIndex < healingSpells.length; spellIndex++){
            jmc.Send("cast '" + healingSpells[spellIndex] + "' " + currentMember.Name);
        }        
    }
}

function ListGroupMembers(){
    jmc.Send("gt Group Members: " + _group.ListMembers());
}
//*********** End Group Commands **********/

//*********** End Functions ***************/




//NOTE: The following functions are meant for internal use, being utilitized by public functions.

//*********** Internal Use ****************/

//*********** Group Utiliy ****************/
function CleanName(memberName){
    var emptyString = "";
    if (memberName == null) return emptyString;
    memberName = memberName.replace(" (Head of group)", emptyString);
    if (memberName == "someone") return emptyString;
    if (memberName.indexOf(" ") !== -1) return emptyString;    
    return memberName;
}

//*********** Group Utiliy ****************/

//*********** Status Utiliy ***************/
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
//*********** Status Utiliy ***************/

String.prototype.toTitleCase = function () {
    return this.replace(
        /\w\S*/g, 
        function(text){
            return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        }
    );
};
