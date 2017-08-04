//*********************************************************************************************************************
//Prototypes
//*********************************************************************************************************************

String.prototype.cleanString = function() {
    return this
        //First, remove all byte order marks and ANSI color codes matching [30m or [0m pattern.
        .replace(/[\u001b]\[\d+m/g, '')
        //...and finally, strip off health status and right angle bracket at beginning of line, if it exists...
        .replace(/^R? ?(?:(?:HP|MV|S):[a-zA-Z]+ ?)*(?:, [a-zA-Z,' ]+:[a-zA-Z]+)?>/, '')
        // .replace(/^(?:(?:HP|MV|S):[a-zA-Z]+ ?)+R?>/, '')
        //Original BOM/ANSI regex... no bueno.  Too many passes per line.
        //.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,'')
}

if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(
            /{(\d+)}/g,
            function(match, number) {
                return typeof args[number] != 'undefined' ?
                    args[number] :
                    match;
            }
        );
    };
}

String.prototype.toTitleCase = function() {
    return this.replace(
        /\w\S*/g,
        function(text) {
            return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        }
    );
}

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
}

Date.prototype.toFriendlyDateString = function() {
    var month = '' + (this.getMonth() + 1);
    var day = '' + this.getDate();
    var year = this.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

String.prototype.captializeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//*********************************************************************************************************************
//End Prototypes
//*********************************************************************************************************************



//*********************************************************************************************************************
//Logging
//*********************************************************************************************************************

var date = new Date();
var fileSystem = new ActiveXObject("Scripting.FileSystemObject");

var errorLogFileName = "C:\\jmc\\3.7.1.1\\Logs\\Debug Logs\\Error - " + date.toFriendlyDateString() + ".txt";
var errorStream = fileSystem.OpenTextFile(errorLogFileName, 8, true);

var damageLogFileName = "C:\\jmc\\3.7.1.1\\Logs\\Damage Logs\\Damage - " + date.toFriendlyDateString() + ".txt";
var damageStream = fileSystem.OpenTextFile(damageLogFileName, 8, true);

var socialLogsFileName = "C:\\jmc\\3.7.1.1\\Logs\\Social Logs\\Social - " + date.toFriendlyDateString() + ".txt";
var socialStream = fileSystem.OpenTextFile(socialLogsFileName, 8, true);

//*********************************************************************************************************************
//End Logging
//*********************************************************************************************************************



//*********************************************************************************************************************
//Fields
//*********************************************************************************************************************

var TIMER_STATUS = 0
var TIMER_AFK = 1
var TIMER_ARKEN_MOVE = 2
var TIMER_ARKEN_WAIT = 3
var TIMER_GROUP_STATISTICS = 4;

//Output windows
var _socialOutputWindow = 1;
var _mapOutputWindow = 2;
var _skillOutputWindow = 3;
var _exitOutputWindow = 4;
var _damageReportOutputWindow = 5;
var _damageOutputWindow = 5;
var _rescueOutputWindow = 6;
var _exceptionOutputWindow = 9;

var _isListeningForDamageTells = true;
var _isListeningForRescue = false;
var _isListeningForStatus = false;
var _isListeningForGroup = false;
var _isGroupFound = false;
var _isListeningForSkills = false;
var _isSkillsFound = false;

var _groupMembers = new GroupMemberCollection();
var _groupMembersTemp = new GroupMemberCollection();
var _maps = new MapCollection();
var _newMap = null;
var _skills = new SkillCollection(0);

var _farothExits = CreateFarothExits();
var _valeExits = CreateValeExits();

var _currentRoomName = "";
var _currentZone = ZoneTypes.None;

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
    } else {
        jmc.KillTimer(TIMER_AFK);
        jmc.ShowMe("Auto AFK is off", "red");
    }
}

function AutoArkenMoveTimer(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_ARKEN_MOVE, 50);
    } else {
        jmc.KillTimer(TIMER_ARKEN_MOVE);
    }
}

function AutoDamageTells(isEnabled) {
    if (_isListeningForDamageTells === isEnabled) return;
    _isListeningForDamageTells = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Parsing damage tells is on.", "green");
    } else {
        jmc.ShowMe("Parsing damage tells is off.", "red");
    }
}

function AutoExits(zoneType) {
    if (_currentZone === zoneType) return;

    var previousZone = _currentZone;

    WriteEmptyLineToWindow(_exitOutputWindow);
    if (previousZone !== ZoneTypes.None) {
        WriteToWindow(_exitOutputWindow, previousZone + " exits disabled.", "red", false, true);
    }
    _currentZone = zoneType;
    switch (zoneType) {
        case ZoneTypes.None:
            break;
        case ZoneTypes.Faroth:
        case ZoneTypes.Vale:
            WriteToWindow(_exitOutputWindow, _currentZone + " exits enabled.", "green", false, true);
            break;
    }
    WriteEmptyLineToWindow(_exitOutputWindow);
}

function AutoGroupStatistics(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_GROUP_STATISTICS, 10);
        jmc.ShowMe("Auto Group Statistics is on", "green");
    } else {
        jmc.KillTimer(TIMER_GROUP_STATISTICS);
        jmc.ShowMe("Auto Group Statistics is off", "red");
    }
}

function AutoArkenWaitTimer(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_ARKEN_WAIT, 1500);
    } else {
        jmc.KillTimer(TIMER_ARKEN_WAIT);
    }
}

function AutoRescue(isEnabled) {
    _isListeningForRescue = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Rescue trigger is on.", "green");
    } else {
        jmc.ShowMe("Rescue trigger is off.", "red");
    }
}

function AutoStatus(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_STATUS, 600);
        jmc.ShowMe("Auto status is on", "green");
    } else {
        jmc.KillTimer(TIMER_STATUS);
        jmc.ShowMe("Auto status is off", "red");
    }
}

//*********************************************************************************************************************
//End Toggles
//*********************************************************************************************************************



//*********************************************************************************************************************
//Exit Commands
//*********************************************************************************************************************

function ListExits() {
    try {
        if (_currentRoomName === "") return;

        var room = null;
        switch (_currentZone) {
            case ZoneTypes.Faroth:
                room = _farothExits.GetRoom(_currentRoomName);
                break;
            case ZoneTypes.Vale:
                room = _valeExits.GetRoom(_currentRoomName);
                break;
        }

        if (room === null) throw "Unable to load room \"" + _currentRoomName + "\"";
        WriteToWindow(_exitOutputWindow, _currentRoomName, "blue", false, true);
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            WriteToWindow(_exitOutputWindow, exit.ExitType + ": " + exit.ExitDirections, "normal", false, true);
        }
        WriteEmptyLineToWindow(_exitOutputWindow);
    } catch (caught) {
        WriteExceptionToStream("Failure listing exits: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure listing exits: ", "red", false, true);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true, true);
    }
}

function NavigateToExit(exitType) {
    try {
        if (_currentRoomName === "") return;

        var room = null;
        switch (_currentZone) {
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

        WriteToWindow(_exitOutputWindow, "Navigating to \"" + exitType + "\"...", "green", true, true);
        jmc.Parse(exit.ExitDirections);

    } catch (caught) {
        WriteExceptionToStream("Failure navigating to " + exitType + ": " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure navigating to " + exitType, "red", false, true);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true, true);
    }
}

function SayExit(exitName) {
    try {
        if (exitName === "") return;

        var room = null;
        switch (_currentZone) {
            case ZoneTypes.Faroth:
                room = _farothExits.GetRoom(exitName);
                break;
            case ZoneTypes.Vale:
                room = _valeExits.GetRoom(exitName);
                break;
        }
        if (room === null) return;

        var message = room.RoomName;
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            message = message + " - " + exit.ExitType + ": " + exit.ExitDirections;
        }
        jmc.Send("gt " + message);
    } catch (caught) {
        WriteExceptionToStream("Failure listing exits: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure listing exits:", "red", false, true);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true, true);
    }
}

function SayExits() {
    try {
        if (_currentRoomName === "") return;

        var room = null;
        switch (_currentZone) {
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
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            jmc.Send("gt " + exit.ExitType + ": " + exit.ExitDirections);
        }
    } catch (caught) {
        WriteExceptionToStream("Failure saying exits: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure saying exits:", "red", false, true);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true, true);
    }
}

function ShowExit(exitName) {
    try {
        if (exitName === "") return;

        var room = null;
        switch (_currentZone) {
            case ZoneTypes.Faroth:
                room = _farothExits.GetRoom(exitName);
                break;
            case ZoneTypes.Vale:
                room = _valeExits.GetRoom(exitName);
                break;
        }

        if (room === null) throw "Unable to load room \"" + exitName + "\"";

        WriteToWindow(_exitOutputWindow, exitName, "blue", false, true);
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            WriteToWindow(_exitOutputWindow, exit.ExitType + ": " + exit.ExitDirections, "normal", false, true);
        }
        WriteEmptyLineToWindow(_exitOutputWindow);
    } catch (caught) {
        WriteExceptionToStream("Failure showing exit: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure showing exit:", "red", false, true);
        WriteToWindow(_exceptionOutputWindow, caught, "red", true, true);
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

function ResetGroup() {
    _isListeningForGroup = true;
    _groupMembersTemp.Clear();
    jmc.Send("group");
}

function ListGroupMembers() {
    jmc.Send("gt Group Members: " + _groupMembers.ListMembers());
}

function ShowHits() {
    try {
        if (_groupMembers !== null) {
            _groupMembers.ListMutilates();
        }
    } catch (caught) {
        WriteExceptionToStream("Failure showing hits: " + caught);
        WriteToWindow(_mapOutputWindow, "Failure showing hits: " + caught, "red", true, true);
    }
}

function DamageReport() {
    ClearWindow(_damageReportOutputWindow);
    if (_groupMembers === null || _groupMembers.Count() === 0) return;
    try {
        WriteToWindow(_damageReportOutputWindow, "Damage Report:", "green", true, false);
        for (var index = 0; index < _groupMembers.Count(); index++) {
            var groupMember = _groupMembers.GroupMembers[index];
            var message = String.format(
                "{0}: Hits: {1}, Total Damage: {2}, Average Damage: {3}, Mutilates: {4}",
                groupMember.MemberName,
                groupMember.HitCount,
                groupMember.Damage,
                groupMember.AverageDamage(),
                groupMember.MutilateCount
            );
            WriteToWindow(_damageReportOutputWindow, message, "normal", false, false);
        }
        WriteEmptyLineToWindow(_damageReportOutputWindow);
    } catch (caught) {
        WriteExceptionToStream("Failure showing hits: " + caught);
        WriteToWindow(_mapOutputWindow, "Failure showing damage report: " + caught, "red", true, true);
    }
}

//*********************************************************************************************************************
//End Group Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Mapping Commands
//*********************************************************************************************************************

function AddMap(mapName, variableName) {
    try {
        _newMap = _maps.Add(mapName.toTitleCase(), variableName);
        jmc.Send("exa " + _newMap.VariableName);
    } catch (caught) {
        WriteExceptionToStream("Failure adding map: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure adding map: " + caught, "red", true, true);
    }
}

function ClearMaps() {
    try {
        ClearWindow(_mapOutputWindow);
        _maps.Clear();
    } catch (caught) {
        WriteExceptionToStream("Failure clearing maps: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure clearing maps: " + caught, "red", true, true);
    }
}

function DeleteMapByName(mapName) {
    try {
        var map = _maps.GetMap(mapName.toTitleCase());
        if (map !== null) {
            _maps.Remove(mapName.MapName);
        }
        ShowMaps();
    } catch (caught) {
        WriteExceptionToStream("Failure deleting map by name: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure deleting map by name: " + caught, "red", true, true);
    }
}

function DeleteMapByIndex(mapIndex) {
    try {
        var map = _maps.GetMapByIndex(mapIndex);
        if (map !== null) {
            _maps.Remove(mapName.MapName);
        }
        ShowMaps();
    } catch (caught) {
        WriteExceptionToStream("Failure deleting map by index: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure deleting map by index: " + caught, "red", true, true);
    }
}

function ShowMap(map) {
    ClearWindow(_mapOutputWindow);
    WriteToWindow(_mapOutputWindow, "Map " + map.MapName, "green", true, false);
    for (var index = 0; index < map.Content.length; index++) {
        WriteToWindow(_mapOutputWindow, map.Content[index], "normal", false, false);
    }
    WriteEmptyLineToWindow(_mapOutputWindow);
}

function ShowMapByName(mapName) {
    try {
        var map = _maps.GetMap(mapName.toTitleCase());
        if (map !== null) {
            ShowMap(map);
        }
    } catch (caught) {
        WriteExceptionToStream("Failure showing map by name: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure showing map: " + caught, "red", true, true);
    }
}

function ShowMapByIndex(mapIndex) {
    try {
        ClearWindow(_mapOutputWindow);
        var map = _maps.GetMapByIndex(mapIndex);
        if (map !== null) {
            ShowMap(map);
        }
    } catch (caught) {
        WriteExceptionToStream("Failure showing map by index: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure showing map by index: " + caught, "red", true, true);
    }
}

function ShowMaps() {
    try {
        ClearWindow(_mapOutputWindow);
        WriteToWindow(_mapOutputWindow, "Registered maps: " + _maps.Maps.length, "green", true, false);
        for (var index = 0; index < _maps.Maps.length; index++) {
            WriteToWindow(_mapOutputWindow, index + ") " + _maps.Maps[index].MapName, "normal", false, false);
        }
        WriteEmptyLineToWindow(_mapOutputWindow);
    } catch (caught) {
        WriteExceptionToStream("Failure showing maps: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure showing maps: " + caught, "red", true, true);
    }
}

//*********************************************************************************************************************
//End Mapping Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Skill Commands
//*********************************************************************************************************************

function DisplaySkills() {
    try {
        ClearWindow(_skillOutputWindow);
        if (_skills === null || _skills.Count() === 0) {
            WriteToWindow(_skillOutputWindow, "No skills have been defined yet.", "red", true, true);
            return;
        }

        var skills = _skills.Skills;
        //Sort all skills in the skill collection by skill name....
        skills.sort(
            function(a, b) {
                if (a.SkillName.toUpperCase() < b.SkillName.toUpperCase()) return -1;
                if (a.SkillName.toUpperCase() > b.SkillName.toUpperCase()) return 1;
                return 0;
            }
        );

        //Write informative information about how many skills and how many remaining sessions you have to the defined output window....
        WriteToWindow(_skillOutputWindow, "Registered skills: " + skills.length, "blue", false, true);
        WriteToWindow(_skillOutputWindow, "Sessions Remaining: " + _skills.SessionsRemaining, _skills.SessionsRemaining >= 0 ? "green" : "red", false, true);
        for (var index = 0; index < skills.length; index++) {
            //...and for each skill, form a message containing the skill name and skill level....
            var skill = skills[index];
            var message = skill.SkillName + ": " + skill.SkillLevel;
            //...add on additional information about duration and cost, if applicable....
            var additional = "";
            if (skill.Time !== "") {
                additional = skill.Time;
            }
            if (skill.Cost !== "") {
                additional = additional === "" ? skill.Cost : additional + ", " + skill.Cost;
            }
            if (additional !== "") {
                message = message + " (" + additional + ")";
            }
            //...and write the skill to the defined output window.
            WriteToWindow(_skillOutputWindow, message, "normal", false, true);
        }
        WriteEmptyLineToWindow(_skillOutputWindow);
    } catch (caught) {
        WriteExceptionToStream("Failure displaying skills: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure displaying skills: " + caught, "red", true, true);
    }
}

function RegisterSkills() {
    WriteToWindow(_skillOutputWindow, "Resetting skills...", "green", true, true);
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

function ParseLine(incomingLine) {
    var cleanLine = incomingLine.cleanString();
    ParseForMap(cleanLine);
    ParseForRescue(cleanLine);
    ParseForSocial(cleanLine);
    ParseForStatus(cleanLine);
    ParseForRoomName(cleanLine);
    ParseForGroupMember(cleanLine);
    ParseForGroupMemberDamage(cleanLine);
    ParseForGroupMemberMutilate(cleanLine);
    ParseForDamageTell(cleanLine);
    ParseForSkill(cleanLine);
}

function ParseForGroupMemberDamage(incomingLine) {
    //TODO: Complete new regex for parsing damage.

    //If our group member collection hasn't been initialized.... don't bother checking the incoming line.
    if (_groupMembers.Count() === 0) return;

    // var theOneRegexToRuleThemAll = /^([a-zA-Z ']+?) (?:(miss|scratch|barely|lightly|deeply|severely|MUTILATE|stab|hit|slash|pound|smite|crush|whip|flail|pierce|stab|cleave)(s|es)?) (?:[a-zA-Z ']+?)\b(\.|!|!!|hard|very|extremely|lightly)/;
    // var matches = incomingLine.match(theOneRegexToRuleThemAll);
    // if (matches === null) return;

    // var damageType = "";
    // switch (matches[2].toLowerCase()){
    //     case "miss":
    //         damage = 0.0;
    //         break;
    //     case "scratch":
    //         damage = 1.0;
    //         break;
    //     case "barely":
    //         damage = 2.5;
    //         break;
    //     case "lightly":
    //         damage = 5.0;
    //         break;
    //     case "":
    //         damage = 9.0;
    //         break;
    //     case "deeply":
    //         damage = 47;
    //         break;
    //     case "severely":
    //         damage = 75;
    //         break;
    //     case "mutilate":
    //         damage = 105;
    //         break;
    //     default:
    //         switch (matches[3]){

    //         case "hard":
    //             damage = 14.5;
    //             break;
    //         case "very hard":
    //             damage = 21;
    //             break;
    //         case "extremely hard":
    //             damage = 29;
    //             break;
    //         }
    // }

    //First check for the really hard or really weak hits...
    var matches = incomingLine.match(/^([a-zA-Z ']+) (miss|scratch|barely|lightly|deeply|severely|MUTILATE).*(?:\.|!|!!)$/);
    if (matches === null) {
        //If that fails... search for the average hits...
        //NOTE: This regex is not 100% accurate.  Must add specific mob types (spider, for example) to the regex where the mob has no body parts.
        matches = incomingLine.match(/^([a-zA-Z ']+) (?:stab|hit|slash|pound|smite|crush|whip|flail|pierce|stab|cleave).*(?:head|body|foot|leg|arm|hand|wing|spider|rat) *(hard|very hard|extremely hard)?\.$/);
    }
    //If we still don't have any matches... return out of the function.
    if (matches === null) return;

    var damageDoer = matches[1];
    if (damageDoer === "You") {
        damageDoer = jmc.GetVar("me");
    }
    if (damageDoer === "") return;

    var groupMember = _groupMembers.GetMember(damageDoer);
    if (groupMember === null) return;

    var damage = 0;
    switch (matches[2].toLowerCase()) {
        case "miss":
            damage = 0.0;
            break;
        case "scratch":
            damage = 1.0;
            break;
        case "barely":
            damage = 2.5;
            break;
        case "lightly":
            damage = 5.0;
            break;
        case "":
            damage = 9.0;
            break;
        case "hard":
            damage = 14.5;
            break;
        case "very hard":
            damage = 21;
            break;
        case "extremely hard":
            damage = 29;
            break;
        case "deeply":
            damage = 47;
            break;
        case "severely":
            damage = 75;
            break;
        case "mutilate":
            damage = 105;
            break;
    }
    groupMember.HitCount++;
    groupMember.Damage += damage;
}

function ParseForSocial(incomingLine) {
    try {
        var socialRegex = /^(?:[a-zA-Z]*) (chat|chats|narrate|narrates|tell|tells|sing|sings|say|says|group-say|group-says|petition|wiznet|wiznets|whispers)(?:[a-zA-Z, ]+)'(.*)'$/;
        var matches = incomingLine.match(socialRegex);
        if (matches !== null) {
            var social = matches[1].replace(/s$/, "");
            var color = "normal";
            switch (social) {
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
    } catch (caught) {
        WriteExceptionToStream("Failure parsing social: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing social: " + caught, "red", true, true);
    }
}

function ParseForDamageTell(incomingLine) {
    if (!_isListeningForDamageTells) return;
    try {
        var damageRegEx = /(?:Lowtheim|Someone) tells you 'You did (\d+) damage to ([a-zA-Z ]+) with spell ([a-zA-Z ]+)\.  (?:\((saved)\))? '/;
        var matches = incomingLine.match(damageRegEx);
        if (matches !== null) {
            var saved = matches[4].trim() !== "";
            var message = "Spell: " + matches[3] + ", Damage: " + matches[1] + ", Saved: " + saved;
            WriteToWindow(_damageOutputWindow, message, "normal", false, true);
            damageStream.WriteLine(jmc.GetVar("me") + "," + matches[3] + "," + matches[1] + "," + matches[2] + "," + saved);
            jmc.DropEvent();
        }
    } catch (caught) {
        WriteExceptionToStream("Failure parsing damage tell: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing damage tell: " + caught, "red", true, true);
    }
}

function ParseForRoomName(incomingLine) {
    if (_currentZone === ZoneTypes.None) return;
    try {
        var matches = incomingLine.match(/^([a-zA-Z\- ]+)    Exits are: (.+)/);
        if (matches !== null && matches.length >= 2) {
            _currentRoomName = matches[1];

            var room = null;
            switch (_currentZone) {
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
    } catch (caught) {
        WriteExceptionToStream("Failure parsing exit line: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing exit line: " + caught, "red", true, true);
    }
}

function ParseForStatus(incomingLine) {
    try {
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
    } catch (caught) {
        WriteExceptionToStream(caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing status line: " + caught, "red", true, true);
    }
}

function ParseForGroupMember(incomingLine) {
    try {
        if (!_isListeningForGroup) return;
        if (!_isGroupFound) {
            if (incomingLine === "Your group consists of:") {
                _isGroupFound = true;
                jmc.DropEvent();
            } else if (incomingLine === "But you are not the member of a group!") {
                var memberName = jmc.GetVar("me");
                if (_groupMembersTemp.IndexOf(memberName) === -1) {
                    _groupMembersTemp.Add(memberName, true);
                }
                _isGroupFound = true;
                jmc.DropEvent();
            }
        } else {
            if (incomingLine === "") {
                //All group members have been located.  Time to merge the collections...
                _isListeningForGroup = _isGroupFound = false;
                //Loop through each member currently grouped...
                for (var index = 0; index < _groupMembers.Count(); index++) {
                    var existingMemberName = _groupMembers.GroupMembers[index].MemberName;
                    //If the member in temp does not exist....
                    var memberInTemp = _groupMembersTemp.GetMember(existingMemberName);
                    if (memberInTemp === null) {
                        //Remove the member from the live collection.
                        _groupMembers.Remove(existingMemberName);
                    }
                }
                //Loop through all members in the new group member collection...
                for (var index = 0; index < _groupMembersTemp.Count(); index++) {
                    var foundMember = _groupMembersTemp.GroupMembers[index];
                    //...and if the group member does not exist in the running collection...
                    if (_groupMembers.IndexOf(foundMember.MemberName) === -1) {
                        //...push him through.
                        _groupMembers.GroupMembers.push(foundMember);
                    }
                }
            } else {
                var matches = incomingLine.match(/^HP: *\w+, *S: *\w+, *MV: *\w+ *-- ([\w -]+)( \(Head of group\))?$/);
                if (matches !== null) {
                    var memberName = matches[1].captializeFirstLetter();
                    if (memberName !== "Someone") {
                        if (_groupMembersTemp.IndexOf(memberName) === -1) {
                            _groupMembersTemp.Add(memberName, matches[2] !== "");
                        }
                    }
                }
                jmc.DropEvent();
            }
        }
    } catch (caught) {
        WriteExceptionToStream("Failure parsing group line: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing group line: " + caught, "red", true, true);
    }
}

function ParseForGroupMemberMutilate(incomingLine) {
    try {
        if (_groupMembers.Count() === 0) return;
        var cleanLine = incomingLine;
        var memberName = "";
        var matches = cleanLine.match(/^(You|[a-zA-Z* ]+) MUTILATES?.*with (?:your|his|her|its) deadly (?:cleave|pierce|stab|cleave|crush|smite|slash)!!$/);
        if (matches !== null) {
            var memberName = matches[1];
            if (memberName === "You") {
                memberName = jmc.GetVar("me");
            }

            if (memberName === "" || _groupMembers.IndexOf(memberName) === -1) {
                return;
            }
            _groupMembers.GetMember(memberName).MutilateCount++;
            jmc.ShowMe("Mutilate registered by: " + memberName);
        }
    } catch (caught) {
        WriteExceptionToStream("Failure parsing mutilate line: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing mutilate line: " + caught, "red", true, true);
    }
}

function ParseForMap(incomingLine) {
    try {
        if (_newMap === null) {
            return;
        }
        if (incomingLine === "You do not see that here.") {
            _maps.Remove(_newMap.MapName);
            jmc.DropEvent();
            jmc.ShowMe("Unrecognized map " + _newMap.VariableName, "red");
            _newMap = null;
            return;
        }

        if (incomingLine === "") {
            if (_newMap.Content.length === 0) {
                _maps.Remove(_newMap.MapName);
                jmc.ShowMe("Map " + _newMap.MapName + " contains no map content.", "red");
            } else {
                jmc.ShowMe("Map " + _newMap.MapName + " has been added successfully.", "green");
                ShowMap(_newMap);
            }
            _newMap = null;
            jmc.DropEvent();
            return;
        }

        var indexOf = _maps.IndexOf(_newMap.MapName);
        if (indexOf === -1) {
            jmc.ShowMe("Error adding map.");
            _newMap = null;
            return;
        }

        var matches = incomingLine.match(/^([ \.+\-|V])+/);
        if (matches !== null && matches.length > 0) {
            _newMap.Content.push(matches[0]);
            jmc.DropEvent();
            return;
        }
    } catch (caught) {
        WriteExceptionToStream("Failure parsing map line: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing map line: " + caught, "red", true, true);
    }
}

function ParseForRescue(incomingLine) {
    try {
        if (!_isListeningForRescue) return;
        var matches = incomingLine.match(/^(.*) turns to fight ([a-zA-Z]*)!$/);
        if (matches !== null) {
            var target = matches[1].toLowerCase();
            var victim = matches[2].toLowerCase();
            switch (victim) {
                case 'fali':
                    jmc.ShowMe(victim + " is not a rescuable target.", "red");
                    break;
                default:
                    jmc.Send("rescue " + victim);
                    break;
            }
            WriteToWindow(_rescueOutputWindow, matches[0], "green", true, true);
        }
    } catch (caught) {
        WriteExceptionToStream("Failure parsing social: " + caught);
        WriteToWindow(_exceptionOutputWindow, "Failure parsing social: " + caught, "red", true, true);
    }
}

function ParseForSkill(incomingLine) {
    if (!_isListeningForSkills) return;

    if (!_isSkillsFound) {
        var matches = incomingLine.match(/^You have (-?\d+) practice sessions left$/);
        if (matches !== null) {
            _isSkillsFound = true;
            _skills.SessionsRemaining = matches[1];
            jmc.DropEvent();
        }
    } else {
        if (incomingLine === "") {
            _isListeningForSkills = false;
            _isSkillsFound = false;
            jmc.DropEvent();
            DisplaySkills();
        } else {
            var matches = incomingLine.match(/^([a-z ]+) *\(([a-zA-Z ]+)\) *(?:\( *(\d+ time)(?:, *(\d+ (?:stamina|spirit)))?\))?$/);
            if (matches !== null) {
                _skills.Add(
                    matches[1].trim().toTitleCase(),
                    matches[2].trim().toTitleCase(),
                    matches[3].trim().toTitleCase(),
                    matches[4].trim().toTitleCase()
                );
                jmc.DropEvent();
            }
        }
    }
}

//*********************************************************************************************************************
//End Line Parsing
//*********************************************************************************************************************



//*********************************************************************************************************************
//Process Timer
//*********************************************************************************************************************

function ProcessTimer(timerID) {
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
        case TIMER_GROUP_STATISTICS:
            OnGroupStatisticsTimer();
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

function OnStatusTimer() {
    _isListeningForStatus = true;
    jmc.Send("score");
}

function OnGroupStatisticsTimer() {
    DamageReport();
}

//*********************************************************************************************************************
//Cascaded Events
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

function ClearWindow(windowNumber) {
    jmc.Parse("#wclear " + windowNumber);
}

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
    } else if (percentage >= 40) {
        jmc.SetStatus(statusWindow, message, "yellow");
    } else {
        jmc.SetStatus(statusWindow, message, "light red");
    }
}

function WriteEmptyLineToWindow(windowNumber) {
    jmc.Parse("#woutput {" + windowNumber + "}{normal}{  }");
}

function WriteToWindow(windowNumber, message, color, newLine, includeTimestamp) {
    message = includeTimestamp ?
        GetTimestamp() + ": " + message :
        message;
    jmc.Parse("#woutput {" + windowNumber + "}{" + color + "}{" + message + "}");
    if (newLine) {
        WriteEmptyLineToWindow(windowNumber);
    }
}

function WriteExceptionToStream(caught) {
    errorStream.WriteLine(GetTimestamp() + ": " + caught);
}

function WriteSocialToStream(social) {
    socialStream.WriteLine(GetTimestamp() + ": " + social);
}

function GetTimestamp() {
    return new Date().toTimeString().substring(0, 8);
}

//*********************************************************************************************************************
//Writing to Windows and Status Bars
//*********************************************************************************************************************