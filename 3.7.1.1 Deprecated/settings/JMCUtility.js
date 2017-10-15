//*********************************************************************************************************************
//Prototypes
//*********************************************************************************************************************
if (!String.prototype.cleanString) {
    String.prototype.cleanString = function() {
        return this
            //First, remove all byte order marks and ANSI color codes matching [30m or [0m pattern.
            .replace(/[\u001b]\[\d+m/g, '')
            //...and finally, strip off health status and right angle bracket at beginning of line, if it exists...
            .replace(/^R? ?(?:(?:Mind|Mount|HP|MV|S):[a-zA-Z ]+ ?)*(?:, [a-zA-Z,' ]+:[a-zA-Z ]+)*?>/, '')
    }
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        // This works much better than >= because it compensates for NaN:
        if (!(position < this.length))
            position = this.length;
        else
            position |= 0; // round position
        return this.substr(position - searchString.length, searchString.length) === searchString;
    };
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

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        return this.substr(position || 0, searchString.length) === searchString;
    };
}

if (!String.prototype.toTitleCase) {
    String.prototype.toTitleCase = function() {
        return this.replace(
            /\w\S*/g,
            function(text) {
                return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
            }
        );
    }
}

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    }
}

if (!String.prototype.toFriendlyDateString) {
    Date.prototype.toFriendlyDateString = function() {
        var month = '' + (this.getMonth() + 1);
        var day = '' + this.getDate();
        var year = this.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    }
}

if (!String.prototype.capitalizeFirstLetter) {
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
}

if (!String.prototype.splice) {
    String.prototype.splice = function(startIndex, charactersToRemove, stringToInsert) {
        return this.slice(0, startIndex) + stringToInsert + this.slice(startIndex + Math.abs(charactersToRemove));
    };
}
//*********************************************************************************************************************
//End Prototypes
//*********************************************************************************************************************


//*********************************************************************************************************************
//Logging
//*********************************************************************************************************************
var date = new Date();
var errorStream = new ActiveXObject("Scripting.FileSystemObject");
var errorLogFileName = "C:\\jmc\\3.7.1.1\\Logs\\Debug Logs\\Error - " + date.toFriendlyDateString() + ".txt";
var errorStream = errorStream.OpenTextFile(errorLogFileName, 8, true);

var _connectionString = "Provider=MSDASQL.1;Password=P@ssw0rd;Persist Security Info=True;User ID=jmcMudClient;Data Source=RotS;Initial Catalog=RotS";
var connection = new ActiveXObject("ADODB.Connection");
connection.ConnectionString = _connectionString;
connection.Open();

//*********************************************************************************************************************
//End Logging
//*********************************************************************************************************************

function SendTextMessage(description, message) {
	var MY_PHONE_NUMBER_EMAIL_ADDRESS = "ENTER_PHONE_NUMBER_HERE_EMAIL_ADDRESS_HERE";
	var wScriptShell = new ActiveXObject("WScript.Shell");
	wScriptShell.Run("C:\\jmc\\3.7.1.1\\emailMessage.bat " + MY_PHONE_NUMBER_EMAIL_ADDRESS + " \"" + description + "\" \"" + message + "\" }", 0, false);
}

//*********************************************************************************************************************
//Fields
//*********************************************************************************************************************

//Timers
var TIMER_STATUS = 0
var TIMER_AFK = 1
var TIMER_ARKEN_MOVE = 2
var TIMER_ARKEN_WAIT = 3
var TIMER_GROUP_STATISTICS = 4;
var TIMER_CHARACTER_STATISTICS = 5;

//Output windows
var _socialOutputWindow = 1;
var _mapOutputWindow = 2;
var _skillOutputWindow = 3;
var _exitOutputWindow = 4;
var _damageReportOutputWindow = 5;
var _rescueOutputWindow = 6;
var _characterStatusOutputWindow = 6;
var _exceptionOutputWindow = 9;

//Toggle variables
var _isListeningForRescue = false;
var _isListeningForScore = false;
var _isListeningForGroup = false;
var _isGroupFound = false;
var _isListeningForSkills = false;
var _isSkillsFound = false;
var _isScoreLineFound = false;
var _isListeningForChillRay = false;
var _isListeningForCurse = false;
var _isListeningForBash = false;
var _isListeningForFlee = false;
var _isListeningForDoors = false;
var _isListeningForInfo = false;
var _isInfoFound = false;
//TODO: Create function to toggle this variable.
var _notifyTells = false;
var _howManySearchPattern = "";
var _isListeningForHowMany = false;
var _howManyFound = false;
var _howManyItemsFound = 0;
var _howManyContainer = "";

//Cache
var _groupMembers = new GroupMemberCollection();
var _skills = new SkillCollection(0);
var _maps = new MapCollection();
var _newMap = null;
var _currentPlayer = null;

//Room Exits
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
var _afkTimerEnabled = false;
var _statusTimerEnabled = false;

function AutoAfk(isEnabled) {
    _afkTimerEnabled = isEnabled;
    if (isEnabled) {
        jmc.SetTimer(TIMER_AFK, 600);
        jmc.ShowMe("Auto AFK is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_AFK);
        jmc.ShowMe("Auto AFK is disabled.", "red");
    }
}

function AutoArkenMoveTimer(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_ARKEN_MOVE, 50);
        jmc.ShowMe("Auto Arken Move Timer is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_ARKEN_MOVE);
        //jmc.ShowMe("Auto Arken Move Timer is disabled.", "red");
    }
}

function AutoArkenWaitTimer(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_ARKEN_WAIT, 2500);
        jmc.ShowMe("Auto Arken Wait Timer is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_ARKEN_WAIT);
    }
}

function AutoBash(isEnabled) {
    _isListeningForBash = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Bash is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Bash is disabled.", "red");
    }
}

function AutoCharacterStatus(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_CHARACTER_STATISTICS, 30);
        jmc.ShowMe("Auto Character Statistics is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_CHARACTER_STATISTICS);
        jmc.ShowMe("Auto Character Statistics is disabled.", "red");
    }
}

function AutoChill(isEnabled) {
    _isListeningForChillRay = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Chill Ray is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Chill Ray is disabled.", "red");
    }
}

function AutoCurse(isEnabled) {
    _isListeningForCurse = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Curse is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Curse is disabled.", "red");
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

function AutoFlee(isEnabled) {
    _isListeningForFlee = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Flee is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Flee is disabled.", "red");
    }
}

function AutoGroupStatistics(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_GROUP_STATISTICS, 30);
        jmc.ShowMe("Auto Group Statistics is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_GROUP_STATISTICS);
        jmc.ShowMe("Auto Group Statistics is disabled.", "red");
    }
}

function AutoOpen(isEnabled) {
    _isListeningForDoors = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Open Doors is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Open Doors is disabled.", "red");
    }
}

function AutoRescue(isEnabled) {
    _isListeningForRescue = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Rescue trigger is enabled.", "green");
    } else {
        jmc.ShowMe("Rescue trigger is disabled.", "red");
    }
}

function AutoStatus(isEnabled) {
    if (isEnabled) {
        _statusTimerEnabled = true;
        jmc.SetTimer(TIMER_STATUS, 200);
        jmc.ShowMe("Auto status is enabled.", "green");
    } else {
        _statusTimerEnabled = false;
        jmc.KillTimer(TIMER_STATUS);
        jmc.ShowMe("Auto status is disabled.", "red");
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

        if (room === null) throw new ParameterException("Unable to load room \"" + _currentRoomName + "\"");
        WriteToWindow(_exitOutputWindow, _currentRoomName, "blue", false, true);
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            WriteToWindow(_exitOutputWindow, exit.ExitType + ": " + exit.ExitDirections, "normal", false, true);
        }
        WriteEmptyLineToWindow(_exitOutputWindow);
    } catch (caught) {
        var message = "Failure Listing Exits: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, caught.message, "red", true, true);
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

        if (room === null) throw new ParameterException("Unable to load room " + _currentRoomName);

        var exit = room.GetExit(exitType);
        if (exit === null) throw new ParameterException("The exit \"" + exitType + "\" doesn't exist for room \"" + _currentRoomName + "\".");

        if (exit.ExitDirections === "") throw new ParameterException("No exits exist.  Are you at the " + exitType + "?");

        WriteToWindow(_exitOutputWindow, "Navigating to \"" + exitType + "\"...", "green", true, true);
        jmc.Parse(exit.ExitDirections);

    } catch (caught) {
        var message = "Failure Navigating: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function RetrieveExit(roomName, zoneType) {

    var command = new ActiveXObject("ADODB.Command");
    var recordSet = new ActiveXObject("ADODB.Recordset");

    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + GetTimestamp() + ": Opening Connection.");
    try {
        jmc.ShowMe(AnsiColors.ForegroundBrightBlue + GetTimestamp() + ": Connection opened...");

        command.ActiveConnection = connection;
        command.CommandType = 4;
        command.CommandText = "dbo.[GetRoom]";

        jmc.ShowMe("Creating parameters...");
        command.Parameters.Append(command.CreateParameter("@RoomName", 200, 1, 100, roomName));
        command.Parameters.Append(command.CreateParameter("@ZoneType", 200, 1, 20, zoneType));

        jmc.ShowMe("Executing");
        recordSet = command.Execute();

        jmc.ShowMe(AnsiColors.ForegroundBrightBlue + GetTimestamp() + ": Data set retrieved... Showing...");

        var message = "Room Name: " + recordSet.Fields("RoomName");
        message = message + ", Front Entrance: " + recordSet.Fields("Exit1");
        message = message + ", Back Entrance: " + recordSet.Fields("Exit2");
        message = message + ", Swamp: " + recordSet.Fields("Exit3");

        jmc.ShowMe(AnsiColors.ForegroundRed + GetTimestamp() + ": " + message);

    } catch (caught) {
        var message = "Failure Retrieving Exit: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    } finally {
        // clean up  
        if (recordSet.State === 1) {
            recordSet.Close();
        }
        // if (connection.State === 1) {
        //     connection.Close();
        // }
        // connection = null;
        recordSet = null;
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
        var message = "Failure Listing Exits: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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

        if (room === null) throw new ParameterException("Unable to load room \"" + _currentRoomName + "\"");
        //jmc.Parse("#wclear {" + farothOutputWindow + "}");       
        jmc.Send("gt " + _currentRoomName);
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            jmc.Send("gt " + exit.ExitType + ": " + exit.ExitDirections);
        }
    } catch (caught) {
        var message = "Failure Saying Exits: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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

        if (room === null) throw new ParameterException("Unable to load room \"" + exitName + "\"");

        WriteToWindow(_exitOutputWindow, exitName, "blue", false, true);
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            WriteToWindow(_exitOutputWindow, exit.ExitType + ": " + exit.ExitDirections, "normal", false, true);
        }
        WriteEmptyLineToWindow(_exitOutputWindow);
    } catch (caught) {
        var message = "Failure Showing Exit: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

//*********************************************************************************************************************
//End Exit Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Character Status Commands
//*********************************************************************************************************************
function DisplayCharacterStatus() {
    try {
        ClearWindow(_characterStatusOutputWindow);
        if (_currentPlayer === null) {
            WriteToWindow(_characterStatusOutputWindow, "No character has been registered.", "red", true, false);
            return;
        }

        var characterLine = AnsiColors.ForegroundBrightBlue + _currentPlayer.Name + AnsiColors.Default + " the level " + AnsiColors.ForegroundBrightBlue + _currentPlayer.Level + AnsiColors.Default + " " + _currentPlayer.Race + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        characterLine = "Logon Time: " + _currentPlayer.LogonTime.toTimeString().substring(0, 8);
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        var totalPreparations = _currentPlayer.SuccessfulPreparations + _currentPlayer.FailedPreparations;
        var successfulColor = CalculateColor(_currentPlayer.SuccessfulPreparations, totalPreparations);

        // characterLine = "Preparations: " + totalPreparations;
        // characterLine = characterLine + ", Successful: " + _currentPlayer.SuccessfulPreparations;
        // characterLine = characterLine + ", Failed: " + _currentPlayer.FailedPreparations;
        // characterLine = characterLine + ", Ratio: " + successfulColor + _currentPlayer.SuccessfulPreparationRatio() + AnsiColors.Default + ".";
        // WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        characterLine = "Warrior: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.WarriorLevel + AnsiColors.Default;
        characterLine = characterLine + ", Ranger: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.RangerLevel + AnsiColors.Default;
        characterLine = characterLine + ", Mystic: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.MysticLevel + AnsiColors.Default;
        characterLine = characterLine + ", Mage: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.MageLevel + AnsiColors.Default;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        var statColor = CalculateColor(_currentPlayer.CurrentStrength, _currentPlayer.MaxStrength);
        characterLine = "Str: " + statColor + _currentPlayer.CurrentStrength + "/" + _currentPlayer.MaxStrength + AnsiColors.Default;

        statColor = CalculateColor(_currentPlayer.CurrentIntelligence, _currentPlayer.MaxIntelligence);
        characterLine = characterLine + ", Int: " + statColor + _currentPlayer.CurrentIntelligence + "/" + _currentPlayer.MaxIntelligence + AnsiColors.Default;

        statColor = CalculateColor(_currentPlayer.CurrentWill, _currentPlayer.MaxWill);
        characterLine = characterLine + ", Wil: " + statColor + _currentPlayer.CurrentWill + "/" + _currentPlayer.MaxWill + AnsiColors.Default;

        statColor = CalculateColor(_currentPlayer.CurrentDexterity, _currentPlayer.MaxDexterity);
        characterLine = characterLine + ", Dex: " + statColor + _currentPlayer.CurrentDexterity + "/" + _currentPlayer.MaxDexterity + AnsiColors.Default;

        statColor = CalculateColor(_currentPlayer.CurrentConstitution, _currentPlayer.MaxConstitution);
        characterLine = characterLine + ", Con: " + statColor + _currentPlayer.CurrentConstitution + "/" + _currentPlayer.MaxConstitution + AnsiColors.Default;

        statColor = CalculateColor(_currentPlayer.CurrentLearningAbility, _currentPlayer.MaxLearningAbility);
        characterLine = characterLine + ", Lea: " + statColor + _currentPlayer.CurrentLearningAbility + "/" + _currentPlayer.MaxLearningAbility + AnsiColors.Default + ".";

        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        characterLine = "Stat Sum: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.StatSum() + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        var ansiColor = CalculateColor(_currentPlayer.CurrentHitPoints, _currentPlayer.MaxHitPoints);
        characterLine = "Hit Points: " + ansiColor + _currentPlayer.CurrentHitPoints + "/" + _currentPlayer.MaxHitPoints;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        ansiColor = CalculateColor(_currentPlayer.CurrentStamina, _currentPlayer.MaxStamina);
        characterLine = "Magic Points: " + ansiColor + _currentPlayer.CurrentStamina + "/" + _currentPlayer.MaxStamina;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        ansiColor = CalculateColor(_currentPlayer.CurrentMoves, _currentPlayer.MaxMoves);
        characterLine = "Move Points: " + ansiColor + _currentPlayer.CurrentMoves + "/" + _currentPlayer.MaxMoves;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        ansiColor = CalculateColor(_currentPlayer.Spirit, 5000); //It is assumed 5k is a nice round number for spirit.
        characterLine = "Spirit: " + ansiColor + _currentPlayer.Spirit;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        characterLine = "OB: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.OffensiveBonus + AnsiColors.Default;
        characterLine = characterLine + ", DB: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.DodgeBonus + AnsiColors.Default;
        characterLine = characterLine + ", PB: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.ParryBonus + AnsiColors.Default;
        characterLine = characterLine + ", Speed: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.AttackSpeed + AnsiColors.Default;
        characterLine = characterLine + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        characterLine = "Defense Sum: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.DefenseSum() + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        characterLine = "XP Gained: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.XPGained + AnsiColors.Default + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        var currentLevelPlusOne = parseInt(_currentPlayer.Level) + 1;
        var xpForLevel = (currentLevelPlusOne * currentLevelPlusOne * 1500) - (_currentPlayer.Level * _currentPlayer.Level * 1500)
        var xpColor = CalculateColor(xpForLevel - _currentPlayer.XPNeeded, xpForLevel);
        characterLine = "XP Needed To Level: " + xpColor + _currentPlayer.XPNeeded + AnsiColors.Default + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);


    } catch (caught) {
        var message = "Failure Displaying Status: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_mapOutputWindow, message, "red", true, true);
    }
}
//********************************************************************************************************************
//End Character Status Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//Group Commands
//*********************************************************************************************************************

function HealGroup(healingSpells, leaderOnly) {
    if (healingSpells === null || healingSpells.length === 0) {
        //If no healing spells provided, set a default set of healing spells to be cast.
        healingSpells = ["regeneration", "vitality", "curing", "insight"];
    }
    for (var index = 0; index < _groupMembers.GroupMembers.length; index++) {
        var currentMember = _groupMembers.GroupMembers[index];
        if (leaderOnly && !currentMember.IsLeader) continue;
        jmc.ShowMe("Healing " + currentMember.MemberName);
        for (var spellIndex = 0; spellIndex < healingSpells.length; spellIndex++) {
            jmc.Send("cast '" + healingSpells[spellIndex] + "' " + currentMember.MemberName);
        }
    }
}

function ResetGroup() {
    _isListeningForGroup = true;
    _groupMembers.Clear();
    jmc.Send("group");
}

function ListGroupMembers() {
    jmc.Send("gt Group Members: " + _groupMembers.ListMembers());
}

//*********************************************************************************************************************
//Mapping Commands
//*********************************************************************************************************************

function AddMap(mapName, variableName) {
    try {
        _newMap = _maps.Add(mapName.toTitleCase(), variableName);
        jmc.Send("exa " + _newMap.VariableName);
    } catch (caught) {
        var message = "Failure Adding Map: " + caught.Message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ClearMaps() {
    try {
        ClearWindow(_mapOutputWindow);
        _maps.Clear();
    } catch (caught) {
        var message = "Failure Clearing Maps: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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
        var message = "Failure Deleting Map By Name: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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
        var message = "Failure Deleting Map By Index: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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
        var message = "Failure Showing Map By Name: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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
        var message = "Failure Deleting Map By Index: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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
        var message = "Failure Showing Maps: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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
        WriteToWindow(_skillOutputWindow, "Registered skills: " + skills.length, "blue", false, false);
        WriteToWindow(_skillOutputWindow, "Sessions Remaining: " + _skills.SessionsRemaining, _skills.SessionsRemaining >= 0 ? "green" : "red", false, false);
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
            WriteToWindow(_skillOutputWindow, message, "normal", false, false);
        }
        WriteEmptyLineToWindow(_skillOutputWindow);
    } catch (caught) {
        var message = "Failure Displaying Skills: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function RegisterSkills() {
    WriteToWindow(_skillOutputWindow, "Resetting skills...", "green", true, true);
    _isListeningForSkills = true;
    _isSkillsFound = false;
    jmc.Send("prac");
}

//*********************************************************************************************************************
//End Skill Commands
//*********************************************************************************************************************



//*********************************************************************************************************************
//HowMany
//*********************************************************************************************************************
function HowMany(searchPattern, container) {
    try {
        if (searchPattern === "") {
            throw new ParameterException("The search pattern cannot be blank.");
        }
        if (container === "") {
            throw new ParameterException("The container cannot be blank.");
        }
        _howManySearchPattern = searchPattern;
        _howManyContainer = container;
        _isListeningForHowMany = true;
        jmc.Send("examine " + container);
    } catch (caught) {
        var message = "Failure Counting HowMany: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}
//*********************************************************************************************************************
//End HowMany
//*********************************************************************************************************************



//*********************************************************************************************************************
//Line Parsing
//*********************************************************************************************************************

function ParseLine(incomingLine) {
    var cleanLine = incomingLine.cleanString();

    //Character Maintenance...
    ParseForLogin(cleanLine);
    ParseForInformation(cleanLine);
    ParseForLevel(cleanLine);
    ParseForScore(cleanLine);
    ParseForStatistics(cleanLine);

    //Group Management....
    ParseForGroupMember(cleanLine);

    //Mapping...
    ParseForMap(cleanLine);

    //Socials...
    ParseForSocial(cleanLine);

    //Navigation...
    ParseForDoor(cleanLine);
    ParseForRoomName(cleanLine);

    //Skill Lists...
    ParseForSkill(cleanLine);


    //Character Skills....
    ParseForBash(cleanLine);
    ParseForChillRay(cleanLine);
    ParseForCurse(cleanLine);
    ParseForFlee(cleanLine);
    ParseForRescue(cleanLine);
    // ParseForPreparation(cleanLine);

    //NOTE: This function changes the jmc.Event line, and could therefore interfere with other functions.  Keep this at the end.
    ParseForHowMany(cleanLine);
}

// function ParseForPreparation(incomingLine) {
//     if (_currentPlayer === null) return;
//     try {
//         if (incomingLine === "") return;
//         if (incomingLine === "You completed your preparations.") {
//             _currentPlayer.SuccessfulPreparations++;
//         }
//         if (incomingLine === "You fumbled with your preparations.") {
//             _currentPlayer.FailedPreparations++;
//         }
//     } catch (caught) {
//         var message = "Failure parsing for preparation: " + caught.message + "\nLine: " + jmc.Event;
//         WriteExceptionToStream(message);
//         WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
//     }
// }

function ParseForLevel(incomingLine) {
    if (_currentPlayer === null) return;
    if (incomingLine === "") return;
    try {
        //If the current character receives a leveled up message...
        if (incomingLine === "You feel more powerful!") {
            //...increment the characters level.
            _currentPlayer.Level++;
            //Store the XP remainder in a variable...
            var xpRemainder = parseInt(_currentPlayer.XPNeeded);
            var currentLevelPlusOne = parseInt(_currentPlayer.Level) + 1;
            //...and calculate how much XP the character needs at the current level...
            _currentPlayer.XPNeeded = (currentLevelPlusOne * currentLevelPlusOne * 1500) - (_currentPlayer.Level * _currentPlayer.Level * 1500);
            //...and if the remainder is a negative number...
            if (xpRemainder < 0) {
                //...credit the player with the remainder.
                _currentPlayer.XPNeeded += xpRemainder;
            }
            //...and return out of the function.
            return;
        }

        if (incomingLine === "You lose a level!") {
            //Get lost level code.
            return;
        }

        //Class Levels
        if (incomingLine === "You have become better at combat!") {
            _currentPlayer.WarriorLevel++;
            return;
        }

        if (incomingLine === "You feel more agile!") {
            _currentPlayer.RangerLevel++;
            return;
        }

        if (incomingLine === "Your spirit grows stronger!") {
            _currentPlayer.MysticLevel++;
            return;
        }

        if (incomingLine === "You feel more adept in magic!") {
            _currentPlayer.MageLevel++;
            return;
        }

        //Stats Hikes    
        if (incomingLine === "Great strength flows through you!") {
            _currentPlayer.MaxStrength++;
            _currentPlayer.CurrentStrength++;
            return;
        }
        if (incomingLine === "Your intelligence has improved!") {
            _currentPlayer.MaxIntelligence++;
            _currentPlayer.CurrentIntelligence++;
            return;
        }
        if (incomingLine === "Your hands feel quicker!") {
            _currentPlayer.MaxDexterity++;
            _currentPlayer.CurrentDexterity++;
            return;
        }
        if (incomingLine === "You feel your mental resolve harden!") {
            _currentPlayer.MaxWill++;
            _currentPlayer.CurrentWill++;
            return;
        }
        if (incomingLine === "You feel much more health!") {
            _currentPlayer.MaxConstitution++;
            _currentPlayer.CurrentConstitution++;
            return;
        }
        if (incomingLine === "You seem more learned!") {
            _currentPlayer.MaxLearningAbility++;
            _currentPlayer.CurrentLearningAbility++;
            return;
        }

        //If the current character receives experience points...
        var matches = incomingLine.match(/^You receive your share of experience -- (\d+) points\.$/);
        if (matches !== null) {
            //...parse the experience points into an integer.
            var parsedExperience = parseInt(matches[1]);
            //If the experience gained exceeds the experience cap....
            if (parsedExperience >= 7000) {
                //...set the actual value gained to the experience cap.
                parsedExperience = 7500;
            }
            //Increment the characters XP Gained counter...
            _currentPlayer.XPGained += parsedExperience;
            //and deduct the XP gained from the XP needed...
            _currentPlayer.XPNeeded -= parsedExperience;
            //Send a loot coin command to the mud...
            jmc.Send("get coin all.corpse");
            //...and return out of the function.
            return;
        }

        matches = incomingLine.match(/^Your spirit increases by (\d+)\.$/);
        if (matches !== null) {
            _currentPlayer.Spirit += parseInt(matches[1]);
            return;
        }

        matches = incomingLine.match(/^You force your Will against [a-zA-Z '-]+'s concentration!$/);
        if (matches !== null) {
            _currentPlayer.Spirit += 2;
            return;
        }
    } catch (caught) {
        var message = "Failure parsing for level: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForBash(incomingLine) {
    if (!_isListeningForBash) return;
    try {
        if (/^.* has recovered from a bash!$/.test(incomingLine)) {
            jmc.Send("bash");
            return;
        }
    } catch (caught) {
        var message = "Failure parsing for bash: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForChillRay(incomingLine) {
    if (!_isListeningForChillRay) return;
    if (incomingLine === "Your victim is not here!") return;
    try {
        if (incomingLine === "You could not concentrate anymore!" || incomingLine === "You lost your concentration!") {
            jmc.Send("cast chill");
            return;
        }

        var matches = incomingLine.match(/^[a-zA-Z\- ']+ shudders as your chill ray strikes (?:him|her|it)\.$/g);
        if (matches !== null) {
            jmc.Send("cast chill");
            return;
        }

    } catch (caught) {
        var message = "Failure parsing for chill-ray: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForCurse(incomingLine) {
    if (!_isListeningForCurse) return;
    if (incomingLine === "") return;
    if (incomingLine === "Your victim is not here!") return;
    try {
        if (incomingLine.startsWith("You force your Will against")) {
            jmc.Send("cast curse");
            return;
        }

        if (incomingLine === "You could not concentrate anymore!" || incomingLine === "You lost your concentration!") {
            jmc.Send("cast curse");
            return;
        }

        var matches = incomingLine.match(/^You couldn't reach [a-zA-Z'\-, ]+ mind.$/);
        if (matches !== null) {
            jmc.Send("cast curse");
            return;
        }

    } catch (caught) {
        var message = "Failure parsing for curse: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForDoor(incomingLine) {
    if (!_isListeningForDoors) return;
    if (incomingLine === "") return;
    try {
        var matches = incomingLine.match(/^The ([A-Za-z]+) seems to be closed\.$/);
        if (matches !== null) {
            jmc.Send("open " + matches[1]);
        }
    } catch (caught) {
        var message = "Failure parsing for door: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForFlee(incomingLine) {
    if (!_isListeningForFlee) return;
    try {
        if (incomingLine === "PANIC!  You couldn't escape!") {
            jmc.Send("flee");
        }
    } catch (caught) {
        var message = "Failure parsing for flee: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForGroupMember(incomingLine) {
    //If we're not listening for a group, abort this function...
    if (!_isListeningForGroup) return;

    try {
        //...otherwise, if the group isn't found yet...
        if (!_isGroupFound) {
            //..check to see if the line is the indicator for the beginning of thr group.
            if (incomingLine === "Your group consists of:") {
                //...and if so, mark the group as found, abort the event, and return from the function.
                jmc.DropEvent();
                _isGroupFound = true;
                return;
            }

            //...if we discover we are not the member of a group...
            if (incomingLine === "But you are not the member of a group!") {
                //...and set myself as the only member of the group!
                var myName = jmc.GetVar("me");
                if (_groupMembers.IndexOf(myName) === -1) {
                    _groupMembers.Add(myName, true);
                }
                //..and stop looking for groups and return out of the function.
                jmc.DropEvent();
                _isListeningForGroup = false;
                return;
            }
            //...and if the line is empty...
            if (incomingLine === "") {
                //...drop the event and return from the function.
                jmc.DropEvent();
                return;
            }
            //If the group is found....
        } else {
            //...and the incoming line is an empty string...
            if (incomingLine === "") {
                //...stop looking for groups and return from the function.
                _isListeningForGroup = false;
                _isGroupFound = false;
                jmc.DropEvent();
                return;
            }
            //...otherwise, parse the line with regular expressions to discover if this line contains a group member...
            var matches = incomingLine.match(/^HP: *\w+, *S: *\w+, *MV: *\w+ *-- ([\w -]+)( \(Head of group\))?$/);
            //...and if there are matches....
            if (matches !== null) {
                //...retrieve the friendly name of the player (capitalized first letter)
                var memberName = matches[1].capitalizeFirstLetter();
                //...and if the person is known to be in the room and not hidden...
                if (memberName !== "Someone") {
                    //...add them to the group as well.
                    if (_groupMembers.IndexOf(memberName) === -1) {
                        _groupMembers.Add(memberName, matches[2] !== "");
                    }
                }
                jmc.DropEvent();
            }
        }
    } catch (caught) {
        var message = "Failure parsing for group-member: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

// function ParseForGroupMemberDamage(incomingLine) {
//     //If our group member collection hasn't been initialized.... don't bother checking the incoming line.
//     if (_groupMembers.Count() === 0) return;
//     try {
//         //First check for the really hard or really weak hits...
//         var matches = incomingLine.match(/^([a-zA-Z ']+) (miss|scratch|barely|lightly|deeply|severely|MUTILATE).*(?:\.|!|!!)$/);
//         if (matches === null) {
//             //If that fails... search for the average hits...
//             //NOTE: This regex is not 100% accurate.  Must add specific mob types (spider, for example) to the regex where the mob has no body parts.
//             matches = incomingLine.match(/^([a-zA-Z ']+) (?:stab|hit|slash|pound|smite|crush|whip|flail|pierce|stab|cleave).*(?:head|body|foot|leg|arm|hand|wing|spider|rat) *(hard|very hard|extremely hard)?\.$/);
//         }
//         //If we still don't have any matches... return out of the function.
//         if (matches === null) return;

//         var damageDoer = matches[1];
//         if (damageDoer === "You") {
//             damageDoer = jmc.GetVar("me");
//         }
//         if (damageDoer === "") return;

//         var groupMember = _groupMembers.GetMember(damageDoer);
//         if (groupMember === null) return;

//         var damage = 0;
//         switch (matches[2].toLowerCase()) {
//             case "miss":
//                 damage = 0.0;
//                 break;
//             case "scratch":
//                 damage = 1.0;
//                 break;
//             case "barely":
//                 damage = 2.5;
//                 break;
//             case "lightly":
//                 damage = 5.0;
//                 break;
//             case "":
//                 damage = 9.0;
//                 break;
//             case "hard":
//                 damage = 14.5;
//                 break;
//             case "very hard":
//                 damage = 21;
//                 break;
//             case "extremely hard":
//                 damage = 29;
//                 break;
//             case "deeply":
//                 damage = 47;
//                 break;
//             case "severely":
//                 damage = 75;
//                 break;
//             case "mutilate":
//                 damage = 105;
//                 groupMember.MutilateCount++;
//                 break;
//         }
//         groupMember.HitCount++;
//         groupMember.Damage += damage;

//     } catch (caught) {
//         var message = "Failure parsing for group-member damage: " + caught.message + "\nLine: " + jmc.Event;
//         //WriteExceptionToStream(message);
//         WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
//     }
// }

function ParseForHowMany(incomingLine) {
    //^[a-z]+ \((?:here|carried)\) : $
    if (!_isListeningForHowMany || _howManySearchPattern === "") return;
    try {
        if (!_howManyFound) {
            if (incomingLine === "") return;
            if (/^[a-z]+ \((?:here|carried)\) : $/.test(incomingLine)) {
                _howManyFound = true;
            }
            return;
        } else if (incomingLine === "") {
            var message = "The pattern '" + AnsiColors.ForegroundBrightBlue + _howManySearchPattern + AnsiColors.Default;
            message = message + "' has been found " + AnsiColors.ForegroundBrightBlue + _howManyItemsFound + AnsiColors.Default;
            message = message + " time(s) in the " + AnsiColors.ForegroundBrightBlue + _howManyContainer + AnsiColors.Default + ".";
            jmc.ShowMe(message); //Write to the main window.
            _howManyLineFound = _isListeningForHowMany = false;
            _howManySearchPattern = "";
            _howManyItemsFound = 0;
            return;
        } else {
            var matches;
            var toChange = [];
            var regExp = new RegExp(_howManySearchPattern, "g");
            while ((matches = regExp.exec(incomingLine)) !== null) {
                _howManyItemsFound++;
                var stopIndex = regExp.lastIndex;
                var startIndex = matches.index;
                toChange.push({
                    StartIndex: startIndex,
                    StopIndex: stopIndex
                });
            }

            var lineToChange = incomingLine;
            for (var index = toChange.length - 1; index >= 0; index--) {
                var itemIndex = toChange[index];
                lineToChange = lineToChange.splice(itemIndex.StopIndex, 0, AnsiColors.Default);
                lineToChange = lineToChange.splice(itemIndex.StartIndex, 0, AnsiColors.ForegroundBrightRed);
            }
            jmc.Event = lineToChange;
        }
    } catch (caught) {
        var message = "Failure parsing for how-many: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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
        var message = "Failure parsing for map: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForRescue(incomingLine) {
    if (!_isListeningForRescue) return;
    try {
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
        var message = "Failure parsing for rescue: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
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
        var message = "Failure parsing for room name: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForScore(incomingLine) {
    if (_currentPlayer === null) return;
    try {

        //Perform a regex test on the incoming line to verify it is a score line...
        var matchesFound = false;
        var matches = incomingLine.match(/^You have (-?[0-9]+)\/([0-9]+) hit, (-?[0-9]+)\/([0-9]+) stamina, (-?[0-9]+)\/([0-9]+) moves, ([0-9]+) spirit\.$/);
        if (matches !== null) {
            matchesFound = true;
            _isScoreLineFound = true;
            _currentPlayer.CurrentHitPoints = parseInt(matches[1]);
            _currentPlayer.MaxHitPoints = parseInt(matches[2]);
            _currentPlayer.CurrentStamina = parseInt(matches[3]);
            _currentPlayer.MaxStamina = parseInt(matches[4]);
            _currentPlayer.CurrentMoves = parseInt(matches[5]);
            _currentPlayer.MaxMoves = parseInt(matches[6]);
            _currentPlayer.Spirit = parseInt(matches[7]);
        }

        if (!matchesFound && _isScoreLineFound) {
            matches = incomingLine.match(/^OB: (-?[\d]+), DB: (-?[\d]+), PB: (-?[\d]+), Speed: ([\d]+), Gold: ([\d]+), XP Needed: ([\d]+K?)\.$/);
            if (matches !== null) {
                matchesFound = true;
                _currentPlayer.OffensiveBonus = parseInt(matches[1]);
                _currentPlayer.DodgeBonus = parseInt(matches[2]);
                _currentPlayer.ParryBonus = parseInt(matches[3]);
                _currentPlayer.AttackSpeed = parseInt(matches[4]);

                //If score XP is a k less than _currentPlayer.XPNeeded, update. If doesn't end in K, update.
                var tnl = matches[6];
                if (!tnl.endsWith("K")) {
                    _currentPlayer.XPNeeded = parseInt(tnl);
                } else {

                    //This is more of an approximation than a science...
                    var tnlAsInt = parseInt(tnl.substring(0, tnl.length - 1) + "999")
                    if (tnlAsInt < _currentPlayer.XPNeeded) {
                        _currentPlayer.XPNeeded = tnlAsInt;
                    }
                }
            }
        }

        if (_isListeningForScore) {
            //If we have found some match for this incoming line...
            if (matchesFound) {
                //...drop the event and return from this function.
                jmc.DropEvent();
                return;
            }

            //If no matches have been found but a score line has been found....
            if (_isScoreLineFound) {
                //...break out of this automatic loop by resetting variables...
                _isListeningForScore = _isScoreLineFound = false;
                if (incomingLine === "") {
                    //...and only drop the event if the line is a blank line.
                    jmc.DropEvent();
                }
            }

        }
    } catch (caught) {
        var message = "Failure parsing for score: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

//This function is used to process an incoming line from the MUD server for skills which are displayed from the "practice" command.
//Processing only occurs if _isListeningForSkills is set to "true".
function ParseForSkill(incomingLine) {
    //If not listening for skills, do not execute any code.
    if (!_isListeningForSkills) return;
    try {
        //If the skills section has not been located yet...
        if (!_isSkillsFound) {
            //If you are sleeping...
            if (incomingLine == "In your dreams, or what?") {
                //...stop listening for skills...
                _isListeningForSkills = false;
                //...and alert that it is not possible to display skills while asleep
                jmc.ShowMe("Cannot load skills while you are asleep.", "red");
                jmc.DropEvent();
                //...and re-display skills...
                DisplaySkills();
                //...and return out of this function.
                return;
            }
            //Otherwise, check the incoming line for the practice session indicator.
            var matches = incomingLine.match(/^You have (-?\d+) practice sessions left$/);
            //If matches are found...
            if (matches !== null) {
                //...set _isSkillsFound to true....
                _isSkillsFound = true;
                //...and reset the skills collection.
                _skills = new SkillCollection(matches[1]);
                //...and set the remaining sessions on the skills collection.
                _skills.SessionsRemaining = matches[1];
                jmc.DropEvent();
            }
            //And regardless of the outcome, return out of the function as all processing for this line has been completed.
            return;
        }
        //If the incoming line is blank space....
        if (incomingLine === "") {
            //...chances are we have found exactly what we were looking for, or nothing at all.  Reset variables...
            _isListeningForSkills = false;
            _isSkillsFound = false;
            jmc.DropEvent();
            //...and display the skills.
            DisplaySkills();
            return;
        }

        //^([a-z ]+) *\(?(\d+%|[a-zA-Z ]+)\)?.*(?:\( *(\d+ time)(?:, *(\d+ (?:stamina|spirit)))?\))?$
        //INCLUDES PERCENTAGES

        //If the incoming line does not meet any of the previous criteria, chances are it's a practice session!
        var matches = incomingLine.match(/^([a-z -/]+) *\(([a-zA-Z ]+)\) *(?:\( *(\d+ time)(?:, *(\d+ (?:stamina|spirit)))?\))?$/);
        //If the line matches the regex....
        if (matches !== null) {
            //...add the skill to the collection....
            _skills.Add(
                matches[1].trim().toTitleCase(),
                matches[2].trim().toTitleCase(),
                matches[3].trim().toTitleCase(),
                matches[4].trim().toTitleCase()
            );
            //...and drop the event.
            jmc.DropEvent();
        }
    } catch (caught) {
        var message = "Failure parsing for skill: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForSocial(incomingLine) {
    try {
        var socialRegex = /^([a-zA-Z ]*) (chat|chats|narrate|narrates|tell|yell|yells|tells|sing|sings|say|says|group-say|group-says|petition|petitions|wiznet|wiznets|whispers) ?(?:[a-zA-Z, ]+)'(.*)'$/;
        var matches = incomingLine.match(socialRegex);
        if (matches !== null) {
            var social = matches[2].replace(/s$/, "");
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
                case "yell":
                    color = "red"
                    break;
            }
            WriteToWindow(_socialOutputWindow, matches[0], color, true, true);
            // && social === "tell" && matches[1] !== "You"
            if (_notifyTells) {
                SendTextMessage(matches[1], matches[0]);
            }
        }
    } catch (caught) {
        var message = "Failure parsing for social: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

function ParseForStatistics(incomingLine) {
    if (_currentPlayer === null) return;
    try {
        //Perform a regex test on the incoming line to verify it is a statistics line...
        var matchesFound = false;
        var matches = incomingLine.match(/^Your fatigue is (\d+); Your willpower is (\d+); Your statistics are$/);
        if (matches !== null) {
            // matchesFound = true;
            return;
        }

        // if (!matchesFound) {
        matches = incomingLine.match(/^Str: *(\d+)\/ *(\d+), Int: *(\d+)\/ *(\d+), Wil: *(\d+)\/ *(\d+), Dex: *(\d+)\/ *(\d+), Con: *(\d+)\/ *(\d+), Lea: *(\d+)\/ *(\d+)\.?$/);
        if (matches !== null) {
            matchesFound = true;

            _currentPlayer.CurrentStrength = parseInt(matches[1]);
            _currentPlayer.MaxStrength = parseInt(matches[2]);
            _currentPlayer.CurrentIntelligence = parseInt(matches[3]);
            _currentPlayer.MaxIntelligence = parseInt(matches[4]);
            _currentPlayer.CurrentWill = parseInt(matches[5]);
            _currentPlayer.MaxWill = parseInt(matches[6]);
            _currentPlayer.CurrentDexterity = parseInt(matches[7]);
            _currentPlayer.MaxDexterity = parseInt(matches[8]);
            _currentPlayer.CurrentConstitution = parseInt(matches[9]);
            _currentPlayer.MaxConstitution = parseInt(matches[10]);
            _currentPlayer.CurrentLearningAbility = parseInt(matches[11]);
            _currentPlayer.MaxLearningAbility = parseInt(matches[12]);
        }
    } catch (caught) {
        var message = "Failure parsing for statistics: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

//This function will process an incoming line for the text "Here we go..." and run whatever login commands are desired.
function ParseForLogin(incomingLine) {
    try {
        //This is a very easy function which will match an exact line and send the information command to the server.
        if (incomingLine === "") return;
        if (incomingLine === "Here we go..." || incomingLine === "Reconnecting.") {
            //Do Post-Login commands.
            _isListeningForInfo = true;
            jmc.Send("info");
            return;
        }

        var matches = incomingLine.match(/^[a-zA-Z -]+ stores your belongings and helps you into your private chamber\.$/);
        if (matches !== null) {
            var playerName = "Unknown";
            if (_currentPlayer !== null) {
                playerName = _currentPlayer.Name;
                _currentPlayer = null;
            }
            WriteToWindow(_socialOutputWindow, "Logout: " + playerName, "blue", true, true);
        }
    } catch (caught) {
        var message = "Failure parsing for login: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

//This function will begin looking for an information return from the server, which consists of several lines which start with
//You or Your, with the oddball being Strength and Constitution.
//TODO: Attempt to rework this method to prevent from evaluating _isListeningForInfo/_isInfoFound so often.
function ParseForInformation(incomingLine) {
    try {

        if (_isListeningForInfo && _isInfoFound && incomingLine === "") {
            _isListeningForInfo = false;
            _isInfoFound = false;
            jmc.DropEvent();
            return;
        }

        //Right off the bat, run this regex.  He will set the _player object to a new instance.
        //You are Atomos test test ,.,12.398 test, an evil (-100) male Uruk-Lhuth.
        var matches = incomingLine.match(/^You are ([A-Za-z]*) .*, an? (?:good|evil|neutral) \((-?\d+)\) (male|female) ([a-zA-Z- ]*)\.$/);
        if (matches !== null) {
            _isInfoFound = true;
            var playerName = matches[1];
            if (_currentPlayer === null || _currentPlayer.Name !== playerName) {
                _currentPlayer = new Player(playerName, matches[2], matches[3], matches[4]);

                jmc.Parse("#spit {Commands/Profiles/" + playerName + ".set} {%0} {ns}");
                jmc.SetVar("me", playerName);

                switch (_currentPlayer.Race) {
                    case RaceTypes.Beorning:
                    case RaceTypes.Dwarf:
                    case RaceTypes.Hobbit:
                    case RaceTypes.Human:
                    case RaceTypes.WoodElf:
                        jmc.Send("blow eye");
                        break;
                }

            } else {
                _currentPlayer.Name = playerName;
                _currentPlayer.Alignment = matches[2];
                _currentPlayer.Gender = matches[3];
                _currentPlayer.Race = matches[4];
            }

            if (_isListeningForInfo) {
                jmc.DropEvent();
            }

            return;

        }

        if (_currentPlayer === null) return;

        if (incomingLine.startsWith("You")) {

            //You have reached level 24.
            matches = incomingLine.match(/^You have reached level (\d+)\.$/);
            if (matches !== null) {
                _currentPlayer.Level = parseInt(matches[1]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            //You are level 4 Warrior, 3 Ranger, 7 Mystic, and 29 Mage.
            matches = incomingLine.match(/^You are level (\d+) Warrior, (\d+) Ranger, (\d+) Mystic, and (\d+) Mage\.$/);
            if (matches !== null) {
                _currentPlayer.WarriorLevel = parseInt(matches[1]);
                _currentPlayer.RangerLevel = parseInt(matches[2]);
                _currentPlayer.MysticLevel = parseInt(matches[3]);
                _currentPlayer.MageLevel = parseInt(matches[4]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            matches = incomingLine.match(/^You are specialized in ([a-z ]+)\.$/);
            if (matches !== null) {
                _currentPlayer.Specialization = matches[1].toTitleCase();

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            matches = incomingLine.match(/^You have (-?\d+)\/(\d+) hit points, (-?\d+)\/(\d+) stamina, (-?\d+)\/(\d+) moves and (-?\d+) spirit\.$/);
            if (matches !== null) {
                _currentPlayer.CurrentHitPoints = parseInt(matches[1]);
                _currentPlayer.MaxHitPoints = parseInt(matches[2]);
                _currentPlayer.CurrentStamina = parseInt(matches[3]);
                _currentPlayer.MaxStamina = parseInt(matches[4]);
                _currentPlayer.CurrentMoves = parseInt(matches[5]);
                _currentPlayer.MaxMoves = parseInt(matches[6]);
                _currentPlayer.Spirit = parseInt(matches[7]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            matches = incomingLine.match(/^Your OB is (-?\d+), dodge is (-?\d+), parry (-?\d+), and your attack speed is (-?\d+)\.$/);
            if (matches !== null) {
                _currentPlayer.OffensiveBonus = parseInt(matches[1]);
                _currentPlayer.DodgeBonus = parseInt(matches[2]);
                _currentPlayer.ParryBonus = parseInt(matches[3]);
                _currentPlayer.AttackSpeed = parseInt(matches[4]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            matches = incomingLine.match(/^You have scored (\d+) experience points, and need (\d+) more to advance\.$/);
            if (matches !== null) {
                _currentPlayer.XPNeeded = parseInt(matches[2]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

        } else if (incomingLine.startsWith("Strength:")) {
            matches = incomingLine.match(/^Strength: (-?\d+)\/(\d+), Intelligence: (-?\d+)\/(\d+), Will: (-?\d+)\/(\d+), Dexterity: (-?\d+)\/(\d+)$/);
            if (matches !== null) {
                _currentPlayer.CurrentStrength = parseInt(matches[1]);
                _currentPlayer.MaxStrength = parseInt(matches[2]);
                _currentPlayer.CurrentIntelligence = parseInt(matches[3]);
                _currentPlayer.MaxIntelligence = parseInt(matches[4]);
                _currentPlayer.CurrentWill = parseInt(matches[5]);
                _currentPlayer.MaxWill = parseInt(matches[6]);
                _currentPlayer.CurrentDexterity = parseInt(matches[7]);
                _currentPlayer.MaxDexterity = parseInt(matches[8]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

        } else if (incomingLine.startsWith("             Constitution:")) {
            matches = incomingLine.match(/^             Constitution: (-?\d+)\/(\d+), Learning Ability: (-?\d+)\/(\d+).$/);
            if (matches !== null) {
                _currentPlayer.CurrentConstitution = parseInt(matches[1]);
                _currentPlayer.MaxConstitution = parseInt(matches[2]);
                _currentPlayer.CurrentLearningAbility = parseInt(matches[3]);
                _currentPlayer.MaxLearningAbility = parseInt(matches[4]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;

            }
        }

        if (_isListeningForInfo && _isInfoFound) {
            jmc.DropEvent();
        }

    } catch (caught) {
        var message = "Failure parsing for information: " + caught.message + "\nLine: " + jmc.Event;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}

//*********************************************************************************************************************
//End Line Parsing
//*********************************************************************************************************************



//*********************************************************************************************************************
//Process Timer
//*********************************************************************************************************************

function ProcessTimer(timerID) {
    if (!jmc.IsConnected) return;
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
        case TIMER_CHARACTER_STATISTICS:
            OnCharacterStatisticsTimer();
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
    jmc.Parse("lookRoom");
}

//Once this function is hit, turn itself off and re-engage the movement timer.
function OnArkenWaitTimer() {
    AutoArkenWaitTimer(false);
    AutoArkenMoveTimer(true);
}

function OnStatusTimer() {
    _isListeningForScore = true;
    jmc.Send("score");
}

function OnGroupStatisticsTimer() {
    DamageReport();
}

function OnCharacterStatisticsTimer() {
    DisplayCharacterStatus();
}

//*********************************************************************************************************************
//Cascaded Events
//*********************************************************************************************************************



//*********************************************************************************************************************
//Helper Functions
//*********************************************************************************************************************

function CalculateColor(currentValue, maximumValue) {
    var percentage = (parseFloat(currentValue) / parseFloat(maximumValue)) * 100.00;
    if (percentage >= 66) {
        return AnsiColors.ForegroundGreen;
    } else if (percentage >= 33) {
        return AnsiColors.ForegroundYellow;
    } else {
        return AnsiColors.ForegroundRed;
    }
}

//*********************************************************************************************************************
//Helper Functions
//*********************************************************************************************************************

function MessageBox(text, value) {
    try {
        //This is a very crappy implementation of an input box...
        // Create Internet Explorer application object.
        var internetExplorerActiveX = new ActiveXObject("InternetExplorer.Application");
        internetExplorerActiveX.navigate("about:blank"); // Empty HTML document 
        internetExplorerActiveX.Visible = 0; // Keep Internet Explorer invisible.

        while (internetExplorerActiveX.Busy) {} // Important: Wait until Internet 
        // Explorer is ready.

        var script = internetExplorerActiveX.Document.Script; // Get scripting object.
        var userInput = script.prompt(text, value); // Open prompt window.
        internetExplorerActiveX.Quit(); // Close Internet Explorer object.
        return userInput;
    } catch (caught) {
        throw new ParameterException("Failure Opening IE: " + caught.message);
    }
}

function Login() {
    try {
        var wshShell = new ActiveXObject("WScript.Shell")
        var characterName = MessageBox("Select a character name...", "Character Name");
        jmc.Send(characterName);

    } catch (caught) {
        var message = "Failure Logging In: " + caught.message;
        WriteExceptionToStream(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
}


//*********************************************************************************************************************
//Writing to Windows and Status Bars
//*********************************************************************************************************************

function ClearWindow(windowNumber) {
    jmc.Parse("#wclear " + windowNumber);
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

function WriteExceptionToStream(caughtMessage) {
    errorStream.WriteLine(GetTimestamp() + ": " + caughtMessage);
}

// function WriteSocialToStream(social) {
//     var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
//     var socialLogsFileName = "C:\\jmc\\3.7.1.1\\Logs\\Social Logs\\Social - " + date.toFriendlyDateString() + ".txt";
//     var socialStream = fileSystem.OpenTextFile(socialLogsFileName, 8, true);
//     socialStream.WriteLine(GetTimestamp() + ": " + social);
// }

function GetTimestamp() {
    return new Date().toTimeString().substring(0, 8);
}

//*********************************************************************************************************************
//Writing to Windows and Status Bars
//*********************************************************************************************************************



//*********************************************************************************************************************
//Initialize Settings
//*********************************************************************************************************************
AutoAfk(true);
AutoCharacterStatus(true);
AutoFlee(true);
AutoOpen(true);
//*********************************************************************************************************************
//End Initialize Settings
//*********************************************************************************************************************