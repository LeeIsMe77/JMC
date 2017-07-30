//*********************************************************************************************************************
//String Prototypes
//*********************************************************************************************************************

String.prototype.cleanString = function(){
    return this
        //Remove ansi color codes and BOM...
        .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,'')
        //...strip off health status at beginning of line, if it exists...
        .replace(/^(?:(?:HP|MV|S):[a-zA-Z]+ ?)+>/, '')
        //...and finally remove the beginning angle bracket from the line...
        .replace(/^R?>/, '');
}

String.prototype.toTitleCase = function () {
	return this.replace(
        /\w\S*/g,
        function (text) {
        	return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        }
    );
}

String.prototype.trim = function () {  
    return this.replace(/^\s+|\s+$/g,'');  
}

Date.prototype.toFriendlyDateString = function(){    
    var month = '' + (this.getMonth() + 1);
    var day = '' + this.getDate();
    var year = this.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

//*********************************************************************************************************************
//End String Prototypes
//*********************************************************************************************************************



//*********************************************************************************************************************
//Fields
//*********************************************************************************************************************

//LOGGING
var date = new Date();
var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
var errorLogFileName = "C:\\jmc\\3.7.1.1\\Logs\\Debug Logs\\Error - " + date.toFriendlyDateString() + ".txt";
var socialLogsFileName = "C:\\jmc\\3.7.1.1\\Logs\\Social Logs\\Social - " + date.toFriendlyDateString() + ".txt";
var damageLogFileName = "C:\\jmc\\3.7.1.1\\Logs\\Damage Logs\\Damage - " + date.toFriendlyDateString() + ".txt";

var errorStream = fileSystem.OpenTextFile(
    errorLogFileName,
    8,
    true
);

var damageStream = fileSystem.OpenTextFile(
    damageLogFileName,
    8,
    true
);

var socialStream = fileSystem.OpenTextFile(
    socialLogsFileName,
    8,
    true
);

var _socialOutputWindow = 1;
var _mapOutputWindow = 2;
var _skillOutputWindow = 2;
var _exitOutputWindow = 2;
var _damageOutputWindow = 3;
var _rescueOutputWindow = 3;
var _exceptionOutputWindow = 9;

var _isListeningForDamageTells = true;
var _isListeningForRescue = false;
var _isListeningForStatus = false;

var _isListeningForGroup = false;
var _isGroupFound = false;
var _isListeningForSkills = false;
var _isSkillsFound = false;

var _groupMembers = new GroupMemberCollection();
var _maps = new MapCollection();
var _newMap = null;
var _skills = new SkillCollection();

var _farothExits = CreateFarothExits();
var _valeExits = CreateValeExits();

var _currentRoomName = "";
var _currentZone = ZoneTypes.None;

function WriteExceptionToStream(caught){
    errorStream.WriteLine(GetTimestamp() + ": " + caught);
}

function WriteSocialToStream(social){
    socialStream.WriteLine(GetTimestamp() + ": " + social);
}

function GetTimestamp(){
    return new Date().toTimeString().substring(0, 8);
}

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
    _isListeningForRescue = isEnabled;
	if (isEnabled) {        
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

    WriteEmptyLineToWindow(_exitOutputWindow);
    if (previousZone !== ZoneTypes.None){
        WriteToWindow(_exitOutputWindow, previousZone + " exits disabled.", "red", false);
    }
    _currentZone = zoneType;
    switch (zoneType){
        case ZoneTypes.None:        
            break;
        case ZoneTypes.Faroth:
        case ZoneTypes.Vale:
            WriteToWindow(_exitOutputWindow, _currentZone + " exits enabled.", "green", false);
            break;        
    }
    WriteEmptyLineToWindow(_exitOutputWindow);
}

function ToggleDamageTells(isEnabled){
    if (_isListeningForDamageTells === isEnabled) return;    
    _isListeningForDamageTells = isEnabled;
    if (isEnabled){
        jmc.ShowMe("Parsing damage tells is on.", "green");
    }
    else{
        jmc.ShowMe("Parsing damage tells is off.", "red");        
    }
}

//*********************************************************************************************************************
//End Toggles
//*********************************************************************************************************************



//*********************************************************************************************************************
//Exit Commands
//*********************************************************************************************************************

function ListExits(){
    try{
        if (_currentRoomName === "") return;

        var room = null;
        switch (_currentZone){
            case ZoneTypes.Faroth:
                room = _farothExits.GetRoom(_currentRoomName);
                break;
            case ZoneTypes.Vale:
                room = _valeExits.GetRoom(_currentRoomName);
                break;
        }

        if (room === null) throw "Unable to load room \"" + _currentRoomName + "\"";
        WriteToWindow(_exitOutputWindow, _currentRoomName, "blue", false);
        for (var index = 0;index < room.Exits.length;index++){
            var exit = room.Exits[index];
            WriteToWindow(_exitOutputWindow, exit.ExitType + ": " + exit.ExitDirections, "normal", false);
        }
        WriteEmptyLineToWindow(_exitOutputWindow);
    }
    catch (caught){
        WriteExceptionToStream("Failure listing exits: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure listing exits: ", "red", false);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true);
    }
}

function NavigateToExit(exitType){
    try{
        if (_currentRoomName === "") return;
        
        var room = null;
        switch (_currentZone){
            case ZoneTypes.Faroth:
                room = _farothExits.GetRoom(_currentRoomName);
                break;
            case ZoneTypes.Vale:
                room = _valeExits.GetRoom(_currentRoomName);
                break;
        }

        if (room === null) throw "Unable to load room " + _currentRoomName;
        
        var exit = room.GetExit(exitType);
        if (exit === null) throw "The exit \"" + exitType + "\" doesn't exist for room \"" + _currentRoomName + "\".";

        if (exit.ExitDirections === "") throw "No exits exist.  Are you at the " + exitType + "?";
    
        WriteToWindow(_exitOutputWindow, "Navigating to \"" + exitType + "\"...", "green");
        jmc.Parse(exit.ExitDirections);

    }
    catch (caught){
        WriteExceptionToStream("Failure navigating to " + exitType + ": " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure navigating to " + exitType , "red", false);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true);
    }
}

function SayExit(exitName){
    try{
        if (exitName === "") return;

        var room = null;
        switch (_currentZone){
            case ZoneTypes.Faroth:
                room = _farothExits.GetRoom(exitName);
                break;
            case ZoneTypes.Vale:
                room = _valeExits.GetRoom(exitName);
                break;
        }        
        if (room === null) return;
        
        var message = room.RoomName;
        for (var index = 0;index < room.Exits.length;index++){
            var exit = room.Exits[index];
            message = message + " - " + exit.ExitType + ": " + exit.ExitDirections;            
        }
        jmc.Send("gt " + message);
    }
    catch (caught){
        WriteExceptionToStream("Failure listing exits: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure listing exits:" , "red", false);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true);
    }
}

function SayExits(){
        try{
        if (_currentRoomName === "") return;

        var room = null;
        switch (_currentZone){
            case ZoneTypes.Faroth:
                room = _farothExits.GetRoom(_currentRoomName);
                break;
            case ZoneTypes.Vale:
                room = _valeExits.GetRoom(_currentRoomName);
                break;
        }

        if (room === null) throw "Unable to load room \"" + _currentRoomName + "\"";
        //jmc.Parse("#wclear {" + farothOutputWindow + "}");        
        jmc.Send("gt " + _currentRoomName);
        for (var index = 0;index < room.Exits.length;index++){
            var exit = room.Exits[index];
            jmc.Send("gt " + exit.ExitType + ": " + exit.ExitDirections);
        }
    }
    catch (caught){
        WriteExceptionToStream("Failure saying exits: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure saying exits:" , "red", false);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true);
    }
}

function ShowExit(exitName){
    try{
        if (exitName === "") return;

        var room = null;
        switch (_currentZone){
            case ZoneTypes.Faroth:
                room = _farothExits.GetRoom(exitName);
                break;
            case ZoneTypes.Vale:
                room = _valeExits.GetRoom(exitName);
                break;
        }

        if (room === null) throw "Unable to load room \"" + exitName + "\"";
        
        WriteToWindow(_exitOutputWindow, exitName, "blue", false);
        for (var index = 0;index < room.Exits.length;index++){
            var exit = room.Exits[index];
            WriteToWindow(_exitOutputWindow, exit.ExitType + ": " + exit.ExitDirections, "normal", false);
        }
        WriteEmptyLineToWindow(_exitOutputWindow);
    }
    catch (caught){
        WriteExceptionToStream("Failure showing exit: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure showing exit:" , "red", false);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true);
    }
}

//*********************************************************************************************************************
//End Exit Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Group Commands
//*********************************************************************************************************************

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

function InitializeGroup() {
	_isListeningForGroup = true;
	//TODO: Implement method to "Update" group without clearing.
	_groupMembers.Clear();
	jmc.Send("group");
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

function AddMap(mapName, variableName) {
    try{
	    _newMap = _maps.Add(mapName.toTitleCase(), variableName);
        jmc.Send("exa " + _newMap.VariableName);
    }
    catch (caught){
        
    }
}

function ClearMaps(){
    try{
	    jmc.Parse("#wclear {" + _mapOutputWindow + "}");
        _maps.Clear();
    }
    catch (caught){
        
    }
}

function DeleteMap(mapName) {
    try{
        _maps.Remove(mapName);
    }
    catch (caught){
        WriteExceptionToStream("Failure deleting map: " + caught);
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{red}{Failure deleting map: " + caught + "}");
    }
}

function DisplayMap(map){        
    if (map.Content.length === 0) throw "Map " + map.MapName + " has no content.";    
    jmc.Parse("#wclear {" + _mapOutputWindow + "}");    
    jmc.Parse("#woutput {" + _mapOutputWindow + "}{red}{" + mapName + "}");
    jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{ }");
	for (var index = 0;index < map.Content.length;index++){
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{" + map.Content[index] + "}");
	}        
}

function ShowHits() {  
    try{
        if (_groupMembers !== null){
            _groupMembers.ListMutilates();
        }
    }
    catch (caught){
        WriteExceptionToStream("Failure showing hits: " + caught);
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{red}{Failure showing hits: " + caught + "}");
    }
}

function ShowMap(mapName) {
    try{
        var map = _maps.GetMap(mapName.toTitleCase());	
        if (map !== null) {
            jmc.Parse("#wclear {" + _mapOutputWindow + "}");
            this.DisplayMap(map);
        }
    }
    catch (caught){
        WriteExceptionToStream("Failure showing map: " + caught);
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{red}{Failure showing map: " + caught + "}");
    }
}

function ShowMapByIndex(index){
    try{
        var map = _maps.GetMapByIndex(index);
        if (map !== null) {
            jmc.Parse("#wclear {" + _mapOutputWindow + "}");
            this.DisplayMap(map);
        }
    }
    catch (caught){
        WriteExceptionToStream("Failure showing map by index: " + caught);
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{red}{Failure showing map by index: " + caught + "}");
    }
}

function ShowMaps() {  
    try{
        jmc.Parse("#wclear {" + _mapOutputWindow + "}");
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{green}{Registered maps: " + _maps.Maps.length +"}");
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{ }");
        for (var index = 0;index < _maps.Maps.length;index++){
            jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{" + index + ") " + _maps.Maps[index].MapName + "}");
        }
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{ }");
    }
    catch (caught){
        WriteExceptionToStream("Failure showing maps: " + caught);
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{normal}{ }");
        jmc.Parse("#woutput {" + _mapOutputWindow + "}{red}{Failure showing maps: " + caught + "}");
    }
}

//*********************************************************************************************************************
//End Mapping Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Skill Commands
//*********************************************************************************************************************

function DisplaySkills(){
    if (_skills === null) {
        _skills = new SkillCollection();
    }

    var skills = _skills.Skills;
    
    //List all skill names in a comma delimited format.
    skills.sort(function(a, b){
        if (a.SkillName.toUpperCase() < b.SkillName.toUpperCase()) return -1;
        if (a.SkillName.toUpperCase() > b.SkillName.toUpperCase()) return 1;
        return 0;
    });
    WriteToWindow(_skillOutputWindow, "Registered skills: " + skills.length, "green", false);
    for (var index = 0;index < skills.length;index++){
        var skill = skills[index];
        var message = skill.SkillName + ": " + skill.SkillLevel;

        var additional = "";
        if (skill.Time !== ""){
            additional = skill.Time;
        }
        if (skill.Cost !== ""){
            additional = additional === "" ? skill.Cost : additional + ", " + skill.Cost;
        }
        if (additional !== ""){
            message = message + " (" + additional + ")";
        }
        WriteToWindow(_skillOutputWindow, message, "normal", false);
    }
    WriteEmptyLineToWindow(_skillOutputWindow);

}

function RegisterSkills() {
	jmc.ShowMe("Registering Skills.");
	_skills.Clear();
    _isListeningForSkills = true;
    _isSkillsFound = false;
	jmc.Send("prac");
}

//*********************************************************************************************************************
//End Skill Commands
//*********************************************************************************************************************

//*********************************************************************************************************************
//Line Parsing
//*********************************************************************************************************************

function ParseLine(incomingLine){
    var cleanLine = incomingLine.cleanString();
    ParseLineForRescue(cleanLine);
    ParseLineForSocial(cleanLine);
    ParseLineForStatus(cleanLine);
	ParseLineForMap(cleanLine);
	ParseLineForGroupMember(cleanLine);
	ParseLineForMutilate(cleanLine);
    ParseLineForExitLine(cleanLine);
    ParseLineForDamageTell(cleanLine);
    ParseForSkill(cleanLine);
}

function ParseLineForSocial(incomingLine){  
    try{
        var socialRegex = /^([a-zA-Z]*) (chat|chats|narrate|narrates|tell|tells|sing|sings|say|says|group-say|group-says|petition|wiznet|wiznets|whispers)(?: to you,)? '(.*)'$/;
        var matches = incomingLine.match(socialRegex);  
        if (matches !== null){        
            var social = matches[2].replace(/s$/, "");
            var color = "normal";
            switch (social){
                case "chat":
                case "narrate":
                    color = "blue";
                    break;
                case "tell":
                case "say":
                    color = "magenta";
                    break;
                case "group-say":
                    color = "green";
                    break;
            }
            WriteToWindow(_socialOutputWindow, matches[0], color, true, true);
            WriteSocialToStream(matches[0]);
        }
    }
    catch (caught){
        WriteExceptionToStream("Failure parsing social: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing social: " + caught, "red", true);
    }
}

function ParseLineForDamageTell(incomingLine){  
    if (!_isListeningForDamageTells) return;
    try{
        var damageRegEx = /(?:Lowtheim|Someone) tells you 'You did (\d+) damage to ([a-zA-Z ]+) with spell ([a-zA-Z ]+)\.  (?:\((saved)\))? '/;
        var matches = incomingLine.match(damageRegEx);  
        if (matches !== null){            
            var saved = matches[4].trim() !== "";
            var message = "Spell: " + matches[3] + ", Damage: " + matches[1] + ", Saved: " + saved;
            WriteToWindow(_damageOutputWindow, message, "normal", false);
            damageStream.WriteLine(jmc.GetVar("me") + "," + matches[3] + "," + matches[1] + "," + matches[2] + "," + saved );
            jmc.DropEvent();
        }
    }
    catch (caught){
        WriteExceptionToStream("Failure parsing damage tell: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing damage tell: " + caught, "red", true);
    }
}

function ParseLineForExitLine(incomingLine){
    if (_currentZone === ZoneTypes.None) return;
    try{
        var cleanLine = incomingLine;
        var matches = cleanLine.match(/^([a-zA-Z\- ]+)    Exits are: (.+)/);
        if (matches !== null && matches.length >= 2){
            _currentRoomName = matches[1];
                
            var room = null;
            switch (_currentZone){
                case ZoneTypes.Faroth:
                    room = _farothExits.GetRoom(_currentRoomName);
                    break;
                case ZoneTypes.Vale:
                    room = _valeExits.GetRoom(_currentRoomName);
                    break;
            }

            if (room === null) return;
            jmc.Event = jmc.Event + " | " + room.GetExitString();
        }
    }
    catch (caught){
        WriteExceptionToStream("Failure parsing exit line: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing exit line: " + caught, "red", true);
    }
}

function ParseLineForStatus(incomingLine){
    try{
        //Perform a regex test on the incoming line to verify it is a score line...
        var matches = incomingLine.match(/^You have ([0-9]+)\/([0-9]+) hit, ([0-9]+)\/([0-9]+) stamina, ([0-9]+)\/([0-9]+) moves, ([0-9]+) spirit.$/);
        if (matches !== null && matches.length > 0) {
            //..and if it is, process the score line.
            SetCharacterStatus(matches[0]);
        }
        if (_isListeningForStatus) {
            if (incomingLine === "") {
                _isListeningForStatus = false;
            }
            jmc.DropEvent();
        }
    }
    catch (caught){
        WriteExceptionToStream(caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing status line: " + caught, "red", true);
    }
}

function ParseLineForGroupMember(incomingLine){
    try{
        if (!_isListeningForGroup) return;

        if (!_isGroupFound){
            if (incomingLine === "Your group consists of:"){
                _isGroupFound = true;
            }
            return;
        }

        if (incomingLine === "But you are not the member of a group!" || incomingLine === ""){
            _isListeningForGroup = _isGroupFound = false;
            return;
        }
        
        var matches = incomingLine.match(/^HP: *[\w]+, *S: *[\w]+, *MV: *[\w]+ *-- ([\w]+)( \(Head of group\))?$/);
        if (matches !== null){
            var memberName = matches[1];
            if (memberName !== "someone"){
                if (_groupMembers.IndexOf(memberName) === -1){
                    _groupMembers.Add(memberName, matches[2] !== "");
                }
            }                
        }
        jmc.DropEvent();
    }
    catch (caught){
        WriteExceptionToStream("Failure parsing group line: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing group line: " + caught, "red", true);
    }
}

function ParseLineForMutilate(incomingLine){
    try{
        if (_groupMembers.Count() === 0) return;
        var cleanLine = incomingLine;
        var memberName = "";    
        var matches = cleanLine.match(/^(You|[a-zA-Z* ]+) MUTILATES? ([a-zA-Z* ']+) (?:head|leg|arm|body|foot) with (?:your|his|her|its) deadly (?:cleave|pierce|stab|cleave|crush|smite|slash)!!$/);
        if (matches !== null){
            var memberName = matches[1];
            if (memberName === "You"){
                memberName = jmc.GetVar("me");
            }
            
            if (memberName === "" || _groupMembers.IndexOf(memberName) === -1){
                return;
            } 

            jmc.ShowMe("Mutilate registered by: " + memberName);
            _groupMembers.IncrementMutilateCount(memberName);        
        }       
    }
    catch (caught){
        WriteExceptionToStream("Failure parsing mutilate line: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing mutilate line: " + caught, "red", true);
    }
}

function ParseLineForMap(incomingLine){
    try{
        if (_newMap === null) return;
        var cleanLine = incomingLine;

        if (incomingLine === "You do not see that here."){
            _maps.Remove(newMap.MapName);
            jmc.DropEvent();
            jmc.ShowMe("Unrecognized map " + newMap.VariableName, "red");
            _newMap = null;
        }
        var indexOf = _maps.IndexOf(newMap.MapName);
        if (indexOf === -1){
            jmc.ShowMe("Error adding map.");
            newMap = null;
            return;       
        }
        var matches = incomingLine.match(/([ .+-|V])+/);
        if (matches !== null && matches.length > 0){
            newMap.Content.push(matches[0]);
            jmc.DropEvent();
            return;
        }    
        else if (incomingLine === ""){
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
    catch (caught){
        WriteExceptionToStream("Failure parsing map line: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing map line: " + caught, "red", true);
    }
}

function ParseLineForRescue(incomingLine){  
    try{
        if (!_isListeningForRescue) return;
        var matches = incomingLine.match(/^(.*) turns to fight ([a-zA-Z]*)!$/);
        if (matches !== null){      
            var target = matches[1].toLowerCase(); 
            var victim = matches[2].toLowerCase();             
            switch (victim){
                case 'fali':
			        jmc.ShowMe(victim + " is not a rescuable target.", "red");
			        break;
		        default:
			        jmc.Send("rescue " + victim);
			        break;
            }
            WriteToWindow(_rescueOutputWindow, matches[0], "green", true);
        }
    }
    catch (caught){
        WriteExceptionToStream("Failure parsing social: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing social: " + caught, "red", true);
    }
}

function ParseForSkill(incomingLine){
    if (!_isListeningForSkills) return;

    if (!_isSkillsFound){
        if(incomingLine.trim().match(/^You have \d+ practice sessions left$/g) !== null) {            
            _isSkillsFound = true;
            jmc.DropEvent();
            return;
        }
    }

    if (incomingLine === ""){
        _isListeningForSkills = false;
        _isSkillsFound = false;
        DisplaySkills();
        return;
    }    
    var matches = incomingLine.match(/^([a-z ]+) *\(([a-zA-Z ]+)\) *(?:\( *(\d+ time)(?:, *(\d+ (?:stamina|spirit)))?\))?$/);
    if (matches !== null){
        _skills.Add(
            matches[1].trim().toTitleCase(), 
            matches[2].trim().toTitleCase(), 
            matches[3].trim().toTitleCase(), 
            matches[4].trim().toTitleCase()
        );
    }       
    jmc.DropEvent(); 
}

//*********************************************************************************************************************
//End Line Parsing
//*********************************************************************************************************************



//*********************************************************************************************************************
//Helper Functions
//*********************************************************************************************************************

function CleanGroupMemberName(memberName) {
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
//Writing to Windows and Status Bars
//*********************************************************************************************************************

function SetCharacterStatus(incomingLine) {
	var splitLine = incomingLine.split(" ");
	WriteToStatusBar("HP", splitLine[2], 1);
	WriteToStatusBar("MP", splitLine[4], 2);
	WriteToStatusBar("MV", splitLine[6], 3);
}

function WriteToStatusBar(name, fraction, statusWindow) {
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

function WriteEmptyLineToWindow(windowNumber){
    jmc.Parse("#woutput {" + windowNumber + "}{normal}{  }");
}

function WriteToWindow(windowNumber, message, color, newLine, includeTimestamp){
    message = includeTimestamp
        ? GetTimestamp() + ": " + message
        : message;
    jmc.Parse("#woutput {" + windowNumber + "}{" + color + "}{" + message + "}");
    if (newLine){
        WriteEmptyLineToWindow(windowNumber);
    }
}
//*********************************************************************************************************************
//Writing to Windows and Status Bars
//*********************************************************************************************************************


