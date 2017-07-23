
//*********************************************************************************************************************
//String Prototypes
//*********************************************************************************************************************
String.prototype.toTitleCase = function () {
	return this.replace(
        /\w\S*/g,
        function (text) {
        	return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        }
    );
};
//*********************************************************************************************************************
//End String Prototypes
//*********************************************************************************************************************



//*********************************************************************************************************************
//Fields
//*********************************************************************************************************************
var _exceptionWindow = 9;
var _isListeningForStatus = false;
var _groupMembers = new GroupMemberCollection();
var _isListeningForGroup = false;
var _maps = new MapCollection();
var _newMap = null;

var _farothExits = CreateFarothExits();
var _currentRoomName = "";
var _currentZone = ZoneTypes.None;
// var _skills = new SkillCollection();
// var _isListeningForSkills = false;
//*********************************************************************************************************************
//End Fields
//*********************************************************************************************************************



//*********************************************************************************************************************
//Toggles
//*********************************************************************************************************************
function AutoAfk(isEnabled) {
	if (isEnabled) {
		jmc.SetTimer(TIMER_AFK, 1500);
		jmc.ShowMe("Auto AFK is on", "green");
	}
	else {
		jmc.KillTimer(1);
		jmc.ShowMe("Auto AFK is off", "red");
	}
}

function AutoArkenMoveTimer(isEnabled) {
	if (isEnabled) {
		jmc.SetTimer(TIMER_ARKEN_MOVE, 50);
	}
	else {
		jmc.KillTimer(TIMER_ARKEN_MOVE);
	}
}

function AutoArkenWaitTimer(isEnabled) {
	if (isEnabled) {
		jmc.SetTimer(TIMER_ARKEN_WAIT, 1500);
	}
	else {
		jmc.KillTimer(TIMER_ARKEN_WAIT);
	}
}

function AutoRescue(isEnabled) {
	//Remove the action just in case it already exists...
	jmc.Parse("#unaction {%0 turns to fight %1!}{#script OnRescue(%0)}");
	if (isEnabled) {
		jmc.Parse("#action {%0 turns to fight %1!}{#script OnRescue(%0)}");
		jmc.ShowMe("Rescue trigger is on.", "green");
	}
	else {
		jmc.ShowMe("Rescue trigger is off.", "red");
	}
}

function AutoStatus(isEnabled) {
	if (isEnabled) {
		jmc.SetTimer(TIMER_STATUS, 600);
		jmc.ShowMe("Auto status is on", "green");
	}
	else {
		jmc.KillTimer(TIMER_STATUS);
		jmc.ShowMe("Auto status is off", "red");
	}
}

function AutoExits(zoneType){
    if (_currentZone === zoneType) return;
    
    var previousZone = _currentZone;

    jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
    if (previousZone !== ZoneTypes.None){
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{red}{" + previousZone + " exits disabled.}");
    }
    _currentZone = zoneType;
    switch (zoneType){
        case ZoneTypes.None:        
            break;
        case ZoneTypes.Faroth:
        case ZoneTypes.Vale:
            jmc.Parse("#woutput {" + _exitOutputWindow + "}{green}{" + _currentZone + " exits enabled.}");
            break;        
    }
    jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
}

//*********************************************************************************************************************
//End Toggles
//*********************************************************************************************************************



//*********************************************************************************************************************
//Exit Commands
//*********************************************************************************************************************

var _exitOutputWindow = 3;
function ListExits(){
    try{
        if (_currentRoomName === "") return;
        var room = _farothExits.GetRoom(_currentRoomName);
        if (room === null) throw "Unable to load room \"" + _currentRoomName + "\"";
        //jmc.Parse("#wclear {" + farothOutputWindow + "}");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{blue}{" + _currentRoomName + "}");
        for (var index = 0;index < room.Exits.length;index++){
            var exit = room.Exits[index];
            jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{" + exit.ExitType + ": " + exit.ExitDirections + "}");
        }
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
    }
    catch (exception){
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{red}{Failure listing exits:}");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{red}{" + exception + "}");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
    }
}

function NavigateToExit(exitType){
    try{
        if (_currentRoomName === "") return;
        
        var room = _farothExits.GetRoom(_currentRoomName);
        if (room === null) throw "Unable to load room " + _currentRoomName;
        
        var exit = room.GetExit(exitType);
        if (exit === null) throw "The exit \"" + exitType + "\" doesn't exist for room \"" + _currentRoomName + "\".";

        if (exit.ExitDirections === "") throw "No exits exist.  Are you at the " + exitType + "?";
    
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{green}{Navigating to \"" + exitType + "\"... }")
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
        jmc.Parse(exit.ExitDirections);

    }
    catch (exception){
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{red}{Failure navigating to " + exitType + ":}");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{red}{" + exception + "}");
        jmc.Parse("#woutput {" + _exitOutputWindow + "}{normal}{ }");
    }
}
//*********************************************************************************************************************
//End Exit Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Group Commands
//*********************************************************************************************************************

function InitializeGroup() {
	_isListeningForGroup = true;
	//TODO: Implement method to "Update" group without clearing.
	_groupMembers.Clear();
	jmc.Send("group");
}

function HealGroup(healingSpells, leaderOnly) {
	if (healingSpells === null || healingSpells.length === 0) {
		//If no healing spells provided, set a default set of healing spells to be cast.
		healingSpells = ["regeneration", "vitality", "curing", "insight"];
	}
	for (var index = 0; index < _groupMembers.length; index++) {
		var currentMember = _groupMembers[index];
		if (leaderOnly && !currentMember.IsLeader) continue;
		jmc.ShowMe("Healing " + currentMember.Name);
		for (var spellIndex = 0; spellIndex < healingSpells.length; spellIndex++) {
			jmc.Send("cast '" + healingSpells[spellIndex] + "' " + currentMember.Name);
		}
	}
}

function ListGroupMembers() {
	jmc.Send("gt Group Members: " + _groupMembers.ListMembers());
}

//*********************************************************************************************************************
//End Group Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Mapping Commands
//*********************************************************************************************************************

var mapOutputWindow = 2;
function AddMap(mapName, variableName) {
	_newMap = _maps.Add(mapName.toTitleCase(), variableName);
	jmc.Send("exa " + _newMap.VariableName);
}

function ClearMaps(){
	jmc.Parse("#wclear {" + mapOutputWindow + "}");
	_maps.Clear();
}

function DeleteMap(mapName) {
    try{
        _maps.Remove(mapName);
    }
    catch (exception){
        jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + mapOutputWindow + "}{red}{Failure deleting map: " + exception + "}");
    }
}

function DisplayMap(map){        
    if (map.Content.length === 0) throw "Map " + map.MapName + " has no content.";    
    jmc.Parse("#wclear {" + mapOutputWindow + "}");    
    jmc.Parse("#woutput {" + mapOutputWindow + "}{red}{" + mapName + "}");
    jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{ }");
	for (var index = 0;index < map.Content.length;index++){
        jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{" + map.Content[index] + "}");
	}        
}

function ShowMap(mapName) {
    try{
        var map = _maps.GetMap(mapName.toTitleCase());	
        if (map !== null) {
            jmc.Parse("#wclear {" + mapOutputWindow + "}");
            this.DisplayMap(map);
        }
    }
    catch (exception){
        jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + mapOutputWindow + "}{red}{Failure showing map: " + exception + "}");
    }
}

function ShowMapByIndex(index){
    try{
        var map = _maps.GetMapByIndex(index);
        if (map !== null) {
            jmc.Parse("#wclear {" + mapOutputWindow + "}");
            this.DisplayMap(map);
        }
    }
    catch (exception){
        jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + mapOutputWindow + "}{red}{Failure showing map by index: " + exception + "}");
    }
}

function ShowMaps() {  
    try{
        jmc.Parse("#wclear {" + mapOutputWindow + "}");
        jmc.Parse("#woutput {" + mapOutputWindow + "}{green}{Registered maps: " + _maps.Maps.length +"}");
        jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{ }");
        for (var index = 0;index < _maps.Maps.length;index++){
            jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{" + index + ") " + _maps.Maps[index].MapName + "}");
        }
        jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{ }");
    }
    catch (exception){
        jmc.Parse("#woutput {" + mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + mapOutputWindow + "}{red}{Failure showing maps: " + exception + "}");
    }
}
//*********************************************************************************************************************
//End Mapping Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Skill Commands
//*********************************************************************************************************************
// function RegisterSkills() {
// 	//DO NOT USE. Incomplete.
// 	jmc.ShowMe("Registering Skills.");
// 	_skills.Clear();
// 	_isListeningForSkills = true;
// 	jmc.Send("rest");
// 	jmc.Send("prac");
// 	jmc.Send("stand");
// }
//*********************************************************************************************************************
//End Skill Commands
//*********************************************************************************************************************


//*********************************************************************************************************************
//Line Parsing
//*********************************************************************************************************************
function ParseForStatus(incomingLine){
    try{
        //Perform a regex test on the incoming line to verify it is a score line...
        var matches = incomingLine.match(new RegExp("You have ([0-9]+)/([0-9]+) hit, ([0-9]+)/([0-9]+) stamina, ([0-9]+)/([0-9]+) moves, ([0-9]+) spirit."));
        if (matches !== null && matches.length > 0) {
            //..and if it is, process the score line.
            SetCharacterStatus(matches[0]);
        }
        if (_isListeningForStatus) {
            if (incomingLine === "" || new RegExp("(.)+>").test(incomingLine)) {
                _isListeningForStatus = false;
            }
            jmc.DropEvent();
        }
    }
    catch (exception){
        jmc.Parse("#woutput {" + _exceptionWindow + "}{red}{Failure parsing status line: " + exception + "}");
    }
}

function ParseForGroupLine(incomingLine){
    try{
        if (!_isListeningForGroup) return;
        if (incomingLine === "" || new RegExp("(.)+>").test(incomingLine)){
            _isListeningForGroup = false;
        }
        else{
            var matches =incomingLine.match(new RegExp("HP:(.)+S:(.)+ MV:(.)+ -- (.)+"));
            if (matches !== null && matches.length > 0){
                var memberNameArray = matches[0].split("-- ");
                if (memberNameArray !== null && memberNameArray.length === 2){
                    var memberName = memberNameArray[1];                    
                    var cleanName = CleanName(memberName);
                    if (cleanName !== "") {
                        if (_groupMembers.IndexOf(cleanName) === -1){
                            _groupMembers.Add(cleanName, memberName.indexOf(" (Head of group)") !== -1);
                        }
                    }
                }
            }        
            jmc.DropEvent();
        }
    }
    catch (exception){
        jmc.Parse("#woutput {" + _exceptionWindow + "}{red}{Failure parsing group line: " + exception + "}");
    }
}

function ParseForMutilate(incomingLine){
    try{
        if (_groupMembers.Count() === 0) return;
        var memberName = "";    
        var memberMutRegEx = incomingLine.match(new RegExp("([a-zA-Z]+) (MUTILATE)(.)+ with (his|her|its) deadly (.)+!!"));
        if (memberMutRegEx !== null && memberMutRegEx.length > 1){
            memberName = memberMutRegEx[1];            
        }
        else {        
            var meMutRegEx = incomingLine.match(new RegExp("(.)*You MUTILATE (.)+ with your deadly (.)+!!"));
            if (meMutRegEx !== null && meMutRegEx.length > 0){            
                memberName = jmc.GetVar("me");
            }
        }
        if (memberName === "" || _groupMembers.IndexOf(memberName) === -1){
            return;
        }    
        jmc.ShowMe("Mutilate registered by: " + memberName);
        _groupMembers.IncrementMutilateCount(memberName);
    }
    catch (exception){
        jmc.Parse("#woutput {" + _exceptionWindow + "}{red}{Failure parsing mutilate line: " + exception + "}");
    }
}

function ParseForMapLine(incomingLine){
    try{
        if (_newMap === null) return;
        if (new RegExp("(.)*You do not see that here.$").test(incomingLine)){        
            _maps.Remove(newMap.MapName);
            jmc.DropEvent();
            jmc.ShowMe("Unrecognized map " + newMap.VariableName, "red");
            _newMap = null;
        }
        var indexOf = _maps.IndexOf(newMap.MapName);
        if (indexOf === -1){
            jmc.ShowMe("Error adding map.");
            newMap = null;
            return true;       
        }
        var matches = incomingLine.match(new RegExp("([ .+-|V])+"));
        if (matches !== null && matches.length > 0){
            newMap.Content.push(matches[0]);
            jmc.DropEvent();
            return true;
        }    
        else if (incomingLine === "" || new RegExp("(.)+>").test(incomingLine)){
            if (newMap.Content.length === 0) {
                _maps.Remove(newMap.MapName);
                jmc.ShowMe("Map " + newMap.MapName + " contains no map content.", "red");
            }
            else{
                jmc.ShowMe("Map " + newMap.MapName + " has been added successfully.", "green");
                newMap.DisplayMap();
            }
            _newMap = null;
        }
    }
    catch (exception){
        jmc.Parse("#woutput {" + _exceptionWindow + "}{red}{Failure parsing map line: " + exception + "}");
    }
}

// function ParseForSkill(incomingLine){
//     if (new RegExp("(.)+>$").test(incomingLine)){
//         _isListeningForSkills = false;
//     }
//     else{
//         var matches =incomingLine.match(new RegExp("([a-z A-Z]+) *\(([a-zA-Z]+)\).+"));
//         if (matches !== null && matches.length > 0){
//             jmc.Output("Matches count: " + matches.length);
//             for (var index = 0;index < matches.length;index++){
//                 jmc.Output("Matches " + index + ": " + matches[index]);
//             }
//         }        
//         // jmc.DropEvent();
//     }
// }


function ParseForExitLine(incomingLine){
    try{
        if (_currentZone === ZoneTypes.None) return;
        var ansiRegex = new RegExp("[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]?", "g");
        var cleanLine = incomingLine.replace(ansiRegex, "");        
        var roomNameReg = new RegExp("(?:.*>)?([a-zA-Z\- ]+)    Exits are: (.+)")
        var matches = cleanLine.match(roomNameReg);
        if (matches !== null && matches.length >= 2){
            _currentRoomName = matches[1];
            var room = null;
            switch (_currentZone){
                case ZoneTypes.Faroth:
                    room = _farothExits.GetRoom(_currentRoomName);
                    break;
            }
            if (room === null) return;
            jmc.Event = jmc.Event + " | " + room.GetExitString();
        }
    }
    catch (exception){
        jmc.Parse("#woutput {" + _exceptionWindow + "}{red}{Failure parsing exit line: " + exception + "}");
    }
}
// if(!String.prototype.trim) {  
//   String.prototype.trim = function () {  
//     return this.replace(/^\s+|\s+$/g,'');  
//   };  
// } 
//*********************************************************************************************************************
//End Line Parsing
//*********************************************************************************************************************



//*********************************************************************************************************************
//Helper Functions
//*********************************************************************************************************************
function CleanName(memberName) {
	var emptyString = "";
	if (memberName === null) return emptyString;
	memberName = memberName.replace(" (Head of group)", emptyString);
	if (memberName === "someone") return emptyString;
	if (memberName.indexOf(" ") !== -1) return emptyString;
	return memberName;
}
//*********************************************************************************************************************
//Helper Functions
//*********************************************************************************************************************


//*********************************************************************************************************************
//Status Parsing
//*********************************************************************************************************************
function SetCharacterStatus(incomingLine) {
	var splitLine = incomingLine.split(" ");
	WriteToStatusWindow("HP", splitLine[2], 1);
	WriteToStatusWindow("MP", splitLine[4], 2);
	WriteToStatusWindow("MV", splitLine[6], 3);
}

function WriteToStatusWindow(name, fraction, statusWindow) {
	var splitFraction = fraction.split("/");
	var percentage = (parseFloat(splitFraction[0]) / parseFloat(splitFraction[1])) * 100.00;    
	var message = name + ": " + fraction;
	if (percentage >= 75) {
		jmc.SetStatus(statusWindow, message, "green");
	}
	else if (percentage >= 40) {
		jmc.SetStatus(statusWindow, message, "yellow");
	}
	else {
		jmc.SetStatus(statusWindow, message, "light red");
	}
}
//*********************************************************************************************************************
//Status Parsing
//*********************************************************************************************************************



//LOGGING
var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
var stream = fileSystem.CreateTextFile("C:\\Temp\\testfile.txt", true);