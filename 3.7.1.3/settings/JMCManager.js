//*********************************************************************************************************************
//Fields
//*********************************************************************************************************************

//Constant Strings
var ACTIVEX_WSCRIPT_SHELL = "WScript.Shell";
var CHARACTER_PROFILE_LOCATION = "Commands/Profiles/";
var COMMAND_RELOAD_PROFILE = "#killall;#spit {Commands/Main.set} {%0};";
var DATABASE_CHARACTER_CONNECTION_STRING = "Provider=MSDASQL.1;Password=P@ssw0rd;Persist Security Info=True;User ID=JMCMudClient;Data Source=RotS;Initial Catalog=RotS";
//var DATABASE_CHARACTER_CONNECTION_STRING = "Provider=SQLNCLI11.1;Persist Security Info=False;User ID=JMCMudClient;Password=P@ssw0rd;Initial Catalog=RotS;Data Source=localhost;DataTypeCompatibility=80;";

//Timers
var TIMER_STATUS = 0;
var TIMER_AFK = 1;
var TIMER_ARKEN_MOVE = 2;
var TIMER_ARKEN_WAIT = 3;
var TIMER_CHARACTER_STATISTICS = 5;

//Output windows
var _socialOutputWindow = 1;
var _mapOutputWindow = 2;
var _skillOutputWindow = 3;
var _exitOutputWindow = 4;
var _rescueOutputWindow = 5;
var _characterStatusOutputWindow = 6;
var _exceptionOutputWindow = 7;

//Toggle variables
var _afkTimerEnabled = false;
var _howManyContainer = "";
var _howManyFound = false;
var _howManyItemsFound = 0;
var _howManySearchPattern = "";
var _identifyPhase = IdentifyPhase.None;
var _isGroupFound = false;
var _isInfoFound = false;
var _isListeningForBash = false;
var _isListeningForChillRay = false;
var _isListeningForCurse = false;
var _isListeningForDoors = false;
var _isListeningForFlee = false;
var _isListeningForGroup = false;
var _isListeningForHowMany = false;
var _isListeningForInfo = false;
var _isListeningForRescue = false;
var _isListeningForScore = false;
var _isListeningForSkills = false;
//TODO: Create function to toggle this variable.
var _isNotifyingTells = false;
var _isScoreLineFound = false;
var _isSkillsFound = false;
var _statusTimerEnabled = false;

//Cache
var _currentCharacter = null;
var _currentItem = null;
var _groupMembers = new GroupMemberCollection();
var _maps = new MapCollection();
var _newMap = null;
var _skills = new SkillCollection(0);

//Room Exits
var _currentRoomName = "";
var _currentZone = ZoneTypes.None;
var _farothExits = CreateFarothExits();
var _valeExits = CreateValeExits();
//*********************************************************************************************************************
//End Fields
//*********************************************************************************************************************


//*********************************************************************************************************************
//Cascaded Event Handlers (From JMCEvents)
//*********************************************************************************************************************

function OnConnected() {
    try {    
        DisplayCharacters(true);

    } catch (caught) {
        WriteToWindow(_exceptionOutputWindow, caught.message, "red", true, true);
        JMCException.LogException(caught.message);
    }
};

function OnConnectionLost() {
    try {
        if (_currentCharacter !== null) {
            _currentCharacter.Update();
            _currentCharacter = null;
        }
        jmc.Parse(COMMAND_RELOAD_PROFILE);
    } catch (caught) {
        WriteToWindow(_exceptionOutputWindow, caught.message, "red", true, true);
        JMCException.LogException(caught.message);
    }
};

function OnDisconnected() {
    try {
        if (_currentCharacter !== null) {
            _currentCharacter.Update();
            _currentCharacter = null;
        }
        jmc.Parse(COMMAND_RELOAD_PROFILE);
    } catch (caught) {
        WriteToWindow(_exceptionOutputWindow, caught.message, "red", true, true);
        JMCException.LogException(caught.message);
    }
};

function OnIncoming(incomingLine) {
    try {

        // jmc.ShowMe(lineParser.EchoLine(incomingLine));

        var cleanLine = incomingLine.cleanString();

        // ParseForHelpBotLine(cleanLine);

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
        ParseForIdentify(cleanLine);

        //NOTE: This function changes the jmc.Event line, and could therefore interfere with other functions.  Keep this at the end.
        ParseForHowMany(cleanLine);

    } catch (caught) {
        WriteToWindow(_exceptionOutputWindow, caught.message, "red", true, true);
    }
};

function OnInput(playerInput) {
    if (_afkTimerEnabled) {
        jmc.SetTimer(TIMER_AFK, 600);
    }
    if (_statusTimerEnabled) {
        jmc.SetTimer(TIMER_STATUS, 200);
    }
};

function OnTimer(timerID) {

    if (timerID !== TIMER_CHARACTER_STATISTICS && (!jmc.IsConnected || _currentCharacter === null)) {
        return;
    }

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
        case TIMER_CHARACTER_STATISTICS:
            OnCharacterStatisticsTimer();
            break;
        default:
            return;
    }
};

//*********************************************************************************************************************
//End Cascaded Event Handlers (From JMCEvents)
//*********************************************************************************************************************


//*********************************************************************************************************************
//Toggles
//*********************************************************************************************************************

function AutoAfk(isEnabled) {
    _afkTimerEnabled = isEnabled;
    if (isEnabled) {
        jmc.SetTimer(TIMER_AFK, 600);
        jmc.ShowMe("Auto AFK is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_AFK);
        jmc.ShowMe("Auto AFK is disabled.", "red");
    }
};

function AutoArkenMoveTimer(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_ARKEN_MOVE, 50);
        jmc.ShowMe("Auto Arken Move Timer is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_ARKEN_MOVE);
        //jmc.ShowMe("Auto Arken Move Timer is disabled.", "red");
    }
};

function AutoArkenWaitTimer(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_ARKEN_WAIT, 2500);
        jmc.ShowMe("Auto Arken Wait Timer is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_ARKEN_WAIT);
    }
};

function AutoBash(isEnabled) {
    _isListeningForBash = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Bash is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Bash is disabled.", "red");
    }
};

function AutoCharacterStatus(isEnabled) {
    if (isEnabled) {
        jmc.SetTimer(TIMER_CHARACTER_STATISTICS, 30);
        jmc.ShowMe("Auto Character Statistics is enabled.", "green");
    } else {
        jmc.KillTimer(TIMER_CHARACTER_STATISTICS);
        jmc.ShowMe("Auto Character Statistics is disabled.", "red");
    }
};

function AutoChill(isEnabled) {
    _isListeningForChillRay = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Chill Ray is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Chill Ray is disabled.", "red");
    }
};

function AutoCurse(isEnabled) {
    _isListeningForCurse = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Curse is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Curse is disabled.", "red");
    }
};

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
};

function AutoFlee(isEnabled) {
    _isListeningForFlee = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Flee is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Flee is disabled.", "red");
    }
};

function AutoOpen(isEnabled) {
    _isListeningForDoors = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Auto Open Doors is enabled.", "green");
    } else {
        jmc.ShowMe("Auto Open Doors is disabled.", "red");
    }
};

function AutoRescue(isEnabled) {
    _isListeningForRescue = isEnabled;
    if (isEnabled) {
        jmc.ShowMe("Rescue trigger is enabled.", "green");
    } else {
        jmc.ShowMe("Rescue trigger is disabled.", "red");
    }
};

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
};

//*********************************************************************************************************************
//End Toggles
//*********************************************************************************************************************


//*********************************************************************************************************************
//Login
//*********************************************************************************************************************

function Login() {
    try {
        if (!jmc.IsConnected) {
            jmc.ShwoMe("Please connect to a server before attempting to login.");
            return;
        }

        //Only allow login if the player is currently not signed in.
        if (_currentCharacter !== null) return;

        var characterName = InputBox("Which character do you wish to log in as?", "Character Name...", "");

        if (characterName === undefined || characterName === null || characterName === "") return;
        var targetCharacter = CharacterCollection.Enumerate().GetCharacter(characterName);
        if (targetCharacter === null) {
            jmc.ShowMe("Character " + characterName + " does not exist.  Please login manually.");
            return;
        }
        _currentCharacter = Character.Initialize(targetCharacter.CharacterID);

        jmc.Send(_currentCharacter.CharacterName);
        if (_currentCharacter.Password !== null && _currentCharacter.Password !== "") {
            jmc.Parse("#daa " + _currentCharacter.Password + ";1");
        }
        //...and load the characters profile and set the variable "me" to the character name.
        jmc.Parse("#spit {" + CHARACTER_PROFILE_LOCATION + targetCharacter.CharacterName + ".set} {%0} {ns}");
        jmc.SetVar("me", targetCharacter.CharacterName);

        //If the character is of the light races, blow out a dragons eye (if one is had). NOTE: Broken, and executes every single time information is typed.
        switch (_currentCharacter.Race) {
            case RaceTypes.Beorning:
            case RaceTypes.Dwarf:
            case RaceTypes.Hobbit:
            case RaceTypes.Human:
            case RaceTypes.WoodElf:
                jmc.Send("blow eye");
                break;
        }

    } catch (caught) {
        var message = "Failure Logging In: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

//*********************************************************************************************************************
//End Login
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

        if (room === null) throw new Error("Unable to load room \"" + _currentRoomName + "\"");
        WriteToWindow(_exitOutputWindow, _currentRoomName, "blue", false, true);
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            WriteToWindow(_exitOutputWindow, exit.ExitType + ": " + exit.ExitDirections, "normal", false, true);
        }
        WriteEmptyLineToWindow(_exitOutputWindow);
    } catch (caught) {
        var message = "Failure Listing Exits: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, caught.message, "red", true, true);
    }
};

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

        if (room === null) throw new Error("Unable to load room " + _currentRoomName);

        var exit = room.GetExit(exitType);
        if (exit === null) throw new Error("The exit \"" + exitType + "\" doesn't exist for room \"" + _currentRoomName + "\".");

        if (exit.ExitDirections === "") throw new Error("No exits exist.  Are you at the " + exitType + "?");

        WriteToWindow(_exitOutputWindow, "Navigating to \"" + exitType + "\"...", "green", true, true);
        jmc.Parse(exit.ExitDirections);

    } catch (caught) {
        var message = "Failure Navigating: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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

        if (room === null) throw new Error("Unable to load room \"" + _currentRoomName + "\"");
        //jmc.Parse("#wclear {" + farothOutputWindow + "}");       
        jmc.Send("gt " + _currentRoomName);
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            jmc.Send("gt " + exit.ExitType + ": " + exit.ExitDirections);
        }
    } catch (caught) {
        var message = "Failure Saying Exits: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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

        if (room === null) throw new Error("Unable to load room \"" + exitName + "\"");

        WriteToWindow(_exitOutputWindow, exitName, "blue", false, true);
        for (var index = 0; index < room.Exits.length; index++) {
            var exit = room.Exits[index];
            WriteToWindow(_exitOutputWindow, exit.ExitType + ": " + exit.ExitDirections, "normal", false, true);
        }
        WriteEmptyLineToWindow(_exitOutputWindow);
    } catch (caught) {
        var message = "Failure Showing Exit: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

//*********************************************************************************************************************
//End Exit Commands
//*********************************************************************************************************************


//*********************************************************************************************************************
//Character Status Commands
//*********************************************************************************************************************

function DisplayCharacters(sampleOnly) {
    try {
        var characters = CharacterCollection.Enumerate().Characters;
        if (characters.length > 0) {
            jmc.ShowMe("+" + "-".padRight("-", 109) + "+")
            var columnHeaderColor = AnsiColors.BackgroundBrightWhite;
            var bracketPlusSpace = AnsiColors.Default + "| ";
            var endBracket = AnsiColors.Default + "|";
            var columnCharacterName = columnHeaderColor + "Character Name".padRight(" ", 28);
            var columnCharacterRace = columnHeaderColor + "Race".padRight(" ", 18);
            var columnCharacterLevel = columnHeaderColor + "Level".padRight(" ", 6);
            var columnCharacterXPNeededToLevel = columnHeaderColor + "XP Needed To Level".padRight(" ", 20);
            var columnCharacterLastLogon = columnHeaderColor + "Last Logon".padRight(" ", 28);

            jmc.ShowMe(bracketPlusSpace + columnCharacterName + bracketPlusSpace + columnCharacterRace + bracketPlusSpace + columnCharacterLevel + bracketPlusSpace + columnCharacterXPNeededToLevel + bracketPlusSpace + columnCharacterLastLogon + endBracket);
            jmc.ShowMe("+" + "-".padRight("-", 109) + "+")
            for (var index = 0; index < characters.length; index++) {

                if (sampleOnly && index >= 15) continue;

                var characterColor = AnsiColors.ForegroundBlue;
                if (index % 2 == 0) {
                    characterColor = AnsiColors.ForegroundCyan;
                }
                var character = characters[index];
                var characterName = characterColor + character.CharacterName.padRight(" ", 28);
                var characterRace = characterColor + character.Race.padRight(" ", 18);
                var characterLevel = characterColor + character.Level.padRight(" ", 6);
                var characterXPNeededToLevel = characterColor + character.XPNeededToLevel.padRight(" ", 20);
                var characterLastLogon = characterColor + String(new Date(character.LastLogon).toFriendlyDate()).padRight(" ", 28);
                jmc.ShowMe(bracketPlusSpace + characterName + bracketPlusSpace + characterRace + bracketPlusSpace + characterLevel + bracketPlusSpace + characterXPNeededToLevel + bracketPlusSpace + characterLastLogon + endBracket);
            }
            jmc.ShowMe("+" + "-".padRight("-", 109) + "+")
        }
    } catch (caught) {
        var message = "Failure Displaying Characters: " + caught.message;
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
        JMCException.LogException(message);
    }
};

function DisplayCharacterStatus() {
    try {
        ClearWindow(_characterStatusOutputWindow);
        if (_currentCharacter === null) {
            WriteToWindow(_characterStatusOutputWindow, "No character has been registered.", "red", true, false);
            return;
        }

        var characterLine = AnsiColors.ForegroundBrightBlue + _currentCharacter.CharacterName + AnsiColors.Default + " the level " + AnsiColors.ForegroundBrightBlue + _currentCharacter.Level + AnsiColors.Default + " " + _currentCharacter.Race + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        characterLine = "Logon Date: " + _currentCharacter.LogonTime.toFriendlyDate();
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        characterLine = "Warrior: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.WarriorLevel + AnsiColors.Default;
        characterLine = characterLine + ", Ranger: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.RangerLevel + AnsiColors.Default;
        characterLine = characterLine + ", Mystic: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.MysticLevel + AnsiColors.Default;
        characterLine = characterLine + ", Mage: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.MageLevel + AnsiColors.Default;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        var statColor = CalculateColor(_currentCharacter.CurrentStrength, _currentCharacter.MaxStrength);
        characterLine = "Str: " + statColor + _currentCharacter.CurrentStrength + "/" + _currentCharacter.MaxStrength + AnsiColors.Default;

        statColor = CalculateColor(_currentCharacter.CurrentIntelligence, _currentCharacter.MaxIntelligence);
        characterLine = characterLine + ", Int: " + statColor + _currentCharacter.CurrentIntelligence + "/" + _currentCharacter.MaxIntelligence + AnsiColors.Default;

        statColor = CalculateColor(_currentCharacter.CurrentWill, _currentCharacter.MaxWill);
        characterLine = characterLine + ", Wil: " + statColor + _currentCharacter.CurrentWill + "/" + _currentCharacter.MaxWill + AnsiColors.Default;

        statColor = CalculateColor(_currentCharacter.CurrentDexterity, _currentCharacter.MaxDexterity);
        characterLine = characterLine + ", Dex: " + statColor + _currentCharacter.CurrentDexterity + "/" + _currentCharacter.MaxDexterity + AnsiColors.Default;

        statColor = CalculateColor(_currentCharacter.CurrentConstitution, _currentCharacter.MaxConstitution);
        characterLine = characterLine + ", Con: " + statColor + _currentCharacter.CurrentConstitution + "/" + _currentCharacter.MaxConstitution + AnsiColors.Default;

        statColor = CalculateColor(_currentCharacter.CurrentLearningAbility, _currentCharacter.MaxLearningAbility);
        characterLine = characterLine + ", Lea: " + statColor + _currentCharacter.CurrentLearningAbility + "/" + _currentCharacter.MaxLearningAbility + AnsiColors.Default + ".";

        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        characterLine = "Stat Sum: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.StatSum() + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        var ansiColor = CalculateColor(_currentCharacter.CurrentHitPoints, _currentCharacter.MaxHitPoints);
        characterLine = "Hit Points: " + ansiColor + _currentCharacter.CurrentHitPoints + "/" + _currentCharacter.MaxHitPoints;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        ansiColor = CalculateColor(_currentCharacter.CurrentStamina, _currentCharacter.MaxStamina);
        characterLine = "Magic Points: " + ansiColor + _currentCharacter.CurrentStamina + "/" + _currentCharacter.MaxStamina;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        ansiColor = CalculateColor(_currentCharacter.CurrentMoves, _currentCharacter.MaxMoves);
        characterLine = "Move Points: " + ansiColor + _currentCharacter.CurrentMoves + "/" + _currentCharacter.MaxMoves;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        ansiColor = CalculateColor(_currentCharacter.Spirit, 5000); //It is assumed 5k is a nice round number for spirit.
        characterLine = "Spirit: " + ansiColor + _currentCharacter.Spirit;
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        characterLine = "OB: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.OffensiveBonus + AnsiColors.Default;
        characterLine = characterLine + ", DB: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.DodgeBonus + AnsiColors.Default;
        characterLine = characterLine + ", PB: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.ParryBonus + AnsiColors.Default;
        characterLine = characterLine + ", Speed: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.AttackSpeed + AnsiColors.Default;
        characterLine = characterLine + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        characterLine = "Defense Sum: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.DefenseSum() + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

        characterLine = "XP Gained: " + AnsiColors.ForegroundBrightBlue + _currentCharacter.XPGained + AnsiColors.Default + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

        var currentLevelPlusOne = parseInt(_currentCharacter.Level) + 1;
        var xpForLevel = (currentLevelPlusOne * currentLevelPlusOne * 1500) - (_currentCharacter.Level * _currentCharacter.Level * 1500)
        var xpColor = CalculateColor(xpForLevel - _currentCharacter.XPNeededToLevel, xpForLevel);
        characterLine = "XP Needed To Level: " + xpColor + _currentCharacter.XPNeededToLevel + AnsiColors.Default + ".";
        WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

    } catch (caught) {
        var message = "Failure Displaying Status: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_mapOutputWindow, message, "red", true, true);
    }
};

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
};

function ListGroupMembers() {
    jmc.Send("gt Group Members: " + _groupMembers.ListMembers());
};

function ResetGroup() {
    _isListeningForGroup = true;
    _groupMembers.Clear();
    jmc.Send("group");
};

//*********************************************************************************************************************
//Mapping Commands
//*********************************************************************************************************************

function AddMap(mapName, variableName) {
    try {
        _newMap = _maps.Add(mapName.toTitleCase(), variableName);
        jmc.Send("exa " + _newMap.VariableName);
    } catch (caught) {
        var message = "Failure Adding Map: " + caught.Message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ClearMaps() {
    try {
        ClearWindow(_mapOutputWindow);
        _maps.Clear();
    } catch (caught) {
        var message = "Failure Clearing Maps: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function DeleteMapByName(mapName) {
    try {
        var map = _maps.GetMap(mapName.toTitleCase());
        if (map !== null) {
            _maps.Remove(mapName.MapName);
        }
        ShowMaps();
    } catch (caught) {
        var message = "Failure Deleting Map By Name: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function DeleteMapByIndex(mapIndex) {
    try {
        var map = _maps.GetMapByIndex(mapIndex);
        if (map !== null) {
            _maps.Remove(mapName.MapName);
        }
        ShowMaps();
    } catch (caught) {
        var message = "Failure Deleting Map By Index: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ShowMap(map) {
    ClearWindow(_mapOutputWindow);
    WriteToWindow(_mapOutputWindow, "Map " + map.MapName, "green", true, false);
    for (var index = 0; index < map.Content.length; index++) {
        WriteToWindow(_mapOutputWindow, map.Content[index], "normal", false, false);
    }
    WriteEmptyLineToWindow(_mapOutputWindow);
};

function ShowMapByName(mapName) {
    try {
        var map = _maps.GetMap(mapName.toTitleCase());
        if (map !== null) {
            ShowMap(map);
        }
    } catch (caught) {
        var message = "Failure Showing Map By Name: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ShowMapByIndex(mapIndex) {
    try {
        ClearWindow(_mapOutputWindow);
        var map = _maps.GetMapByIndex(mapIndex);
        if (map !== null) {
            ShowMap(map);
        }
    } catch (caught) {
        var message = "Failure Deleting Map By Index: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function RegisterSkills() {
    WriteToWindow(_skillOutputWindow, "Resetting skills...", "green", true, true);
    _isListeningForSkills = true;
    _isSkillsFound = false;
    jmc.Send("prac");
};

//*********************************************************************************************************************
//End Skill Commands
//*********************************************************************************************************************


//*********************************************************************************************************************
//HowMany
//*********************************************************************************************************************

function HowMany(searchPattern, container) {
    try {
        if (searchPattern === "") {
            throw new Error("The search pattern cannot be blank.");
        }
        if (container === "") {
            throw new Error("The container cannot be blank.");
        }
        _howManySearchPattern = searchPattern;
        _howManyContainer = container;
        _isListeningForHowMany = true;
        jmc.Send("examine " + container);
    } catch (caught) {
        var message = "Failure Counting HowMany: " + caught.message;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

//*********************************************************************************************************************
//End HowMany
//*********************************************************************************************************************


//*********************************************************************************************************************
//Line Parsing
//*********************************************************************************************************************

function ParseForBash(incomingLine) {
    if (!_isListeningForBash) return;
    try {
        if (/^.* has recovered from a bash!$/.test(incomingLine)) {
            jmc.Send("bash");
            return;
        }
    } catch (caught) {
        var message = "Failure parsing for bash: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ParseForFlee(incomingLine) {
    if (!_isListeningForFlee) return;
    try {
        if (incomingLine === "PANIC!  You couldn't escape!") {
            jmc.Send("flee");
        }
    } catch (caught) {
        var message = "Failure parsing for flee: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ParseForIdentify(incomingLine) {
    try {

        incomingLine = incomingLine.trim();

        if (incomingLine === "You feel dizzy and tired from your mental exertion.") {
            _identifyPhase = IdentifyPhase.None;
        }

        if (_identifyPhase === IdentifyPhase.None) {

            if (_currentItem !== null) {
                ItemCollection.Add(_currentItem);
                _currentItem = null;
            }

            var matches = incomingLine.match(/^You feel certain the object you have is (?:a(?:n)? )?([a-zA-Z\- ',]+).$/);
            if (matches !== null) {
                jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Item Name: " + matches[1]);
                _currentItem = new Item(matches[1]);
                _identifyPhase = IdentifyPhase.Description;
                return;
            }
        }

        if (_currentItem === null) {
            _identifyPhase = IdentifyPhase.None;
            return;
        }

        if (incomingLine === "This item has no additional attributes." || incomingLine === "This item has the following attributes.") {
            jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "ID Phase Attributes");
            _identifyPhase = IdentifyPhase.Attributes;
            return;
        }

        if (incomingLine === "This item has no addictional affections." || incomingLine === "This item has the following affections.") {
            jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "ID Phase Affections");
            _identifyPhase = IdentifyPhase.Affections;
            return;
        }

        switch (_identifyPhase) {
            case IdentifyPhase.Description:

                if (incomingLine === "") {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Description: " + _currentItem.Description);
                    _identifyPhase = IdentifyPhase.Statistics;
                    return;
                }

                if (_currentItem.Description === "") {
                    _currentItem.Description = incomingLine;
                } else {
                    _currentItem.Description = _currentItem.Description + " " + incomingLine;
                }
                break;
            case IdentifyPhase.Statistics:

                if (incomingLine === "") {
                    return;
                }

                var matches = incomingLine.match(/^This ([a-zA-Z\- ]+) is made (?:of|from) ([a-zA-Z\- ]+), and weighs ([\d\.]+)lbs\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Item type: " + matches[1]);
                    _currentItem.ItemType = matches[1];
                    _currentItem.Material = matches[2];
                    _currentItem.Weight = parseFloat(matches[3]);
                    return;
                }

                matches = incomingLine.match(/^This ([a-zA-Z\- ]+) can be taken and ([a-zA-Z ]+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Item Usage: " + matches[2]);
                    _currentItem.ItemType = matches[1];
                    _currentItem.Usage = matches[2];
                    return;
                }

                matches = incomingLine.match(/^(?:This|The) weapon you hold is a(?:n)? ([a-zA-Z\- ]+) weapon\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Weapon type: " + matches[1]);
                    _currentItem.ItemType = matches[1];
                    return;
                }

                matches = incomingLine.match(/^Damage Rating +(\d+)\/(\d+)\.$/);
                if (matches !== null) {
                    var damageRating = parseFloat(String(matches[1]) + String(matches[2])) / 1000;

                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Damage Rating: " + damageRating);
                    _currentItem.DamageRating = parseFloat(damageRating);
                    return;
                }

                matches = incomingLine.match(/^Offensive Bonus +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Offensive Bonus: " + matches[1]);
                    _currentItem.OffensiveBonus = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^Absorbtion +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Absorbtion: " + matches[1]);
                    _currentItem.Absorbtion = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^Min Absorbtion +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "MinAbsorbtion: " + matches[1]);
                    _currentItem.MinimumAbsorbtion = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^Encumberance +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Encumberance: " + matches[1]);
                    _currentItem.Encumberance = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^Dodge(?: Bonus)? +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Dodge: " + matches[1]);
                    _currentItem.Dodge = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^Parry(?: Bonus)? +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Parry: " + matches[1]);
                    _currentItem.Parry = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^Bulk +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Bulk: " + matches[1]);
                    _currentItem.Bulk = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^To Hit +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "To Hit: " + matches[1]);
                    _currentItem.ToHit = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^To Damage +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "To Damage: " + matches[1]);
                    _currentItem.ToDamage = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^Break Percentage +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Break Percentage: " + matches[1]);
                    _currentItem.BreakPercentage = parseInt(matches[1]);
                    return;
                }

                matches = incomingLine.match(/^Capacity +(\-?\d+)\.$/);
                if (matches !== null) {
                    jmc.ShowMe(AnsiColors.ForegroundBrightBlue + "Capacity: " + matches[1]);
                    _currentItem.Capacity = parseInt(matches[1]);
                    return;
                }

                break;
            case IdentifyPhase.Attributes:
                if (incomingLine === "") {
                    return;
                }
                _currentItem.Attributes.push(incomingLine);
                break;
            case IdentifyPhase.Affections:
                if (incomingLine === "") {
                    _identifyPhase = IdentifyPhase.None;
                    return;
                }
                _currentItem.Affections.push(incomingLine);
                break;
        }
    } catch (caught) {
        _identifyPhase = IdentifyPhase.None;
        _currentItem = null;
        var message = "Failure parsing for identify: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
            //If the current character is null...
            if (_currentCharacter === null) {
                var characterCollection = CharacterCollection.Enumerate();
                //...attempt to retrieve the character from the cached character collection...
                var character = characterCollection.GetCharacter(playerName);
                //...If he is null, create a new character...
                if (character === null) {
                    _currentCharacter = CharacterCollection.Add(playerName);
                } else {
                    //...otherwise, set the found character to the current character.
                    _currentCharacter = character;
                }

                //...and load the characters profile and set the variable "me" to the character name.
                jmc.Parse("#spit {Commands/Profiles/" + playerName + ".set} {%0} {ns}");
                jmc.SetVar("me", playerName);

                //If the character is of the light races, blow out a dragons eye (if one is had). NOTE: Broken, and executes every single time information is typed.
                switch (_currentCharacter.Race) {
                    case RaceTypes.Beorning:
                    case RaceTypes.Dwarf:
                    case RaceTypes.Hobbit:
                    case RaceTypes.Human:
                    case RaceTypes.WoodElf:
                        jmc.Send("blow eye");
                        break;
                }

            }

            //...adjust all properties for the current character as they have been obtained from the game...
            _currentCharacter.CharacterName = playerName;
            _currentCharacter.Alignment = matches[2];
            _currentCharacter.Gender = matches[3];
            _currentCharacter.Race = matches[4];
            if (_isListeningForInfo) {
                jmc.DropEvent();
            }
            return;
        }

        if (_currentCharacter === null) return;

        if (incomingLine.startsWith("You")) {

            //You have reached level 24.
            matches = incomingLine.match(/^You have reached level (\d+)\.$/);
            if (matches !== null) {
                _currentCharacter.Level = parseInt(matches[1]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            //You are level 4 Warrior, 3 Ranger, 7 Mystic, and 29 Mage.
            matches = incomingLine.match(/^You are level (\d+) Warrior, (\d+) Ranger, (\d+) Mystic, and (\d+) Mage\.$/);
            if (matches !== null) {
                _currentCharacter.WarriorLevel = parseInt(matches[1]);
                _currentCharacter.RangerLevel = parseInt(matches[2]);
                _currentCharacter.MysticLevel = parseInt(matches[3]);
                _currentCharacter.MageLevel = parseInt(matches[4]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            matches = incomingLine.match(/^You are specialized in ([a-z ]+)\.$/);
            if (matches !== null) {
                _currentCharacter.Specialization = matches[1].toTitleCase();

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            matches = incomingLine.match(/^You have (-?\d+)\/(\d+) hit points, (-?\d+)\/(\d+) stamina, (-?\d+)\/(\d+) moves and (-?\d+) spirit\.$/);
            if (matches !== null) {
                _currentCharacter.CurrentHitPoints = parseInt(matches[1]);
                _currentCharacter.MaxHitPoints = parseInt(matches[2]);
                _currentCharacter.CurrentStamina = parseInt(matches[3]);
                _currentCharacter.MaxStamina = parseInt(matches[4]);
                _currentCharacter.CurrentMoves = parseInt(matches[5]);
                _currentCharacter.MaxMoves = parseInt(matches[6]);
                _currentCharacter.Spirit = parseInt(matches[7]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            matches = incomingLine.match(/^Your OB is (-?\d+), dodge is (-?\d+), parry (-?\d+), and your attack speed is (-?\d+)\.$/);
            if (matches !== null) {
                _currentCharacter.OffensiveBonus = parseInt(matches[1]);
                _currentCharacter.DodgeBonus = parseInt(matches[2]);
                _currentCharacter.ParryBonus = parseInt(matches[3]);
                _currentCharacter.AttackSpeed = parseInt(matches[4]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

            matches = incomingLine.match(/^You have scored (\d+) experience points, and need (\d+) more to advance\.$/);
            if (matches !== null) {

                var actualXPNeeded = parseInt(matches[2]);
                //Though this is poor logic and I need some sort of flag to track whether a character has been initialized, I will based this currently off of XP gained === 0;
                var differenceInXP = _currentCharacter.XPNeededToLevel - actualXPNeeded;
                _currentCharacter.XPNeededToLevel = actualXPNeeded;

                if (_currentCharacter.XPGained !== 0) {
                    _currentCharacter.XPGained += differenceInXP;
                }

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

        } else if (incomingLine.startsWith("Strength:")) {
            matches = incomingLine.match(/^Strength: (-?\d+)\/(\d+), Intelligence: (-?\d+)\/(\d+), Will: (-?\d+)\/(\d+), Dexterity: (-?\d+)\/(\d+)$/);
            if (matches !== null) {
                _currentCharacter.CurrentStrength = parseInt(matches[1]);
                _currentCharacter.MaxStrength = parseInt(matches[2]);
                _currentCharacter.CurrentIntelligence = parseInt(matches[3]);
                _currentCharacter.MaxIntelligence = parseInt(matches[4]);
                _currentCharacter.CurrentWill = parseInt(matches[5]);
                _currentCharacter.MaxWill = parseInt(matches[6]);
                _currentCharacter.CurrentDexterity = parseInt(matches[7]);
                _currentCharacter.MaxDexterity = parseInt(matches[8]);

                if (_isListeningForInfo) {
                    jmc.DropEvent();
                }

                return;
            }

        } else if (incomingLine.startsWith("             Constitution:")) {
            matches = incomingLine.match(/^             Constitution: (-?\d+)\/(\d+), Learning Ability: (-?\d+)\/(\d+).$/);
            if (matches !== null) {
                _currentCharacter.CurrentConstitution = parseInt(matches[1]);
                _currentCharacter.MaxConstitution = parseInt(matches[2]);
                _currentCharacter.CurrentLearningAbility = parseInt(matches[3]);
                _currentCharacter.MaxLearningAbility = parseInt(matches[4]);

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ParseForLevel(incomingLine) {
    if (_currentCharacter === null) return;
    if (incomingLine === "") return;
    try {
        //If the current character receives a leveled up message...
        if (incomingLine === "You feel more powerful!") {
            //...increment the characters level.
            _currentCharacter.Level++;
            //Store the XP remainder in a variable...
            var xpRemainder = parseInt(_currentCharacter.XPNeededToLevel);
            var currentLevelPlusOne = parseInt(_currentCharacter.Level) + 1;
            //...and calculate how much XP the character needs at the current level...
            _currentCharacter.XPNeededToLevel = (currentLevelPlusOne * currentLevelPlusOne * 1500) - (_currentCharacter.Level * _currentCharacter.Level * 1500);
            //...and if the remainder is a negative number...
            if (xpRemainder < 0) {
                //...credit the player with the remainder.
                _currentCharacter.XPNeededToLevel += xpRemainder;
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
            _currentCharacter.WarriorLevel++;
            return;
        }

        if (incomingLine === "You feel more agile!") {
            _currentCharacter.RangerLevel++;
            return;
        }

        if (incomingLine === "Your spirit grows stronger!") {
            _currentCharacter.MysticLevel++;
            return;
        }

        if (incomingLine === "You feel more adept in magic!") {
            _currentCharacter.MageLevel++;
            return;
        }

        //Stats Hikes    
        if (incomingLine === "Great strength flows through you!") {
            _currentCharacter.MaxStrength++;
            _currentCharacter.CurrentStrength++;
            return;
        }
        if (incomingLine === "Your intelligence has improved!") {
            _currentCharacter.MaxIntelligence++;
            _currentCharacter.CurrentIntelligence++;
            return;
        }
        if (incomingLine === "Your hands feel quicker!") {
            _currentCharacter.MaxDexterity++;
            _currentCharacter.CurrentDexterity++;
            return;
        }
        if (incomingLine === "You feel your mental resolve harden!") {
            _currentCharacter.MaxWill++;
            _currentCharacter.CurrentWill++;
            return;
        }
        if (incomingLine === "You feel much more health!") {
            _currentCharacter.MaxConstitution++;
            _currentCharacter.CurrentConstitution++;
            return;
        }
        if (incomingLine === "You seem more learned!") {
            _currentCharacter.MaxLearningAbility++;
            _currentCharacter.CurrentLearningAbility++;
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
            _currentCharacter.XPGained += parsedExperience;
            //and deduct the XP gained from the XP needed...
            _currentCharacter.XPNeededToLevel -= parsedExperience;
            //Send a loot coin command to the mud...
            jmc.Send("get coin corpse");
            //...and return out of the function.
            return;
        }

        matches = incomingLine.match(/^Your spirit increases by (\d+)\.$/);
        if (matches !== null) {
            _currentCharacter.Spirit += parseInt(matches[1]);
            return;
        }

        matches = incomingLine.match(/^You force your Will against [a-zA-Z '-]+'s concentration!$/);
        if (matches !== null) {
            _currentCharacter.Spirit += 2;
            return;
        }
    } catch (caught) {
        var message = "Failure parsing for level: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
    } catch (caught) {
        var message = "Failure parsing for login: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ParseForRescue(incomingLine) {
    if (!_isListeningForRescue) return;
    try {
        //Don't rescue Fali: /(.*) turns to fight (?!Fali!)([a-zA-Z]+)!$/
        // /(.*) turns to fight ([a-zA-Z]+)!$/
        var matches = incomingLine.match(/(.*) turns to fight (?!Fali!|Fimli!)([a-zA-Z]+)!$/);
        if (matches !== null) {
            jmc.Send("rescue " + matches[2]);
        }
    } catch (caught) {
        var message = "Failure parsing for rescue: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ParseForScore(incomingLine) {
    if (_currentCharacter === null) return;
    try {

        //Perform a regex test on the incoming line to verify it is a score line...
        var matchesFound = false;
        var matches = incomingLine.match(/^You have (-?[0-9]+)\/([0-9]+) hit, (-?[0-9]+)\/([0-9]+) stamina, (-?[0-9]+)\/([0-9]+) moves, ([0-9]+) spirit\.$/);
        if (matches !== null) {
            matchesFound = true;
            _isScoreLineFound = true;
            _currentCharacter.CurrentHitPoints = parseInt(matches[1]);
            _currentCharacter.MaxHitPoints = parseInt(matches[2]);
            _currentCharacter.CurrentStamina = parseInt(matches[3]);
            _currentCharacter.MaxStamina = parseInt(matches[4]);
            _currentCharacter.CurrentMoves = parseInt(matches[5]);
            _currentCharacter.MaxMoves = parseInt(matches[6]);
            _currentCharacter.Spirit = parseInt(matches[7]);
        }

        if (!matchesFound && _isScoreLineFound) {
            matches = incomingLine.match(/^OB: (-?[\d]+), DB: (-?[\d]+), PB: (-?[\d]+), Speed: ([\d]+), Gold: ([\d]+), XP Needed: ([\d]+)(K?)\.$/);
            if (matches !== null) {
                matchesFound = true;
                _currentCharacter.OffensiveBonus = parseInt(matches[1]);
                _currentCharacter.DodgeBonus = parseInt(matches[2]);
                _currentCharacter.ParryBonus = parseInt(matches[3]);
                _currentCharacter.AttackSpeed = parseInt(matches[4]);

                //If score XP is a k less than _currentCharacter.XPNeededToLevel, update. If doesn't end in K, update.                
                var estimatedXPNeeded = parseInt(_currentCharacter.XPNeededToLevel);
                var actualXPNeeded = parseInt(matches[6]);
                if (matches[7] === "K") {
                    actualXPNeeded = (actualXPNeeded * 1000) + 750; //Add 750 as the middle ground.
                    var difference = estimatedXPNeeded - actualXPNeeded;

                    if (actualXPNeeded < estimatedXPNeeded) {
                        _currentCharacter.XPNeededToLevel = actualXPNeeded;
                        _currentCharacter.XPGained += difference;
                    }
                } else {
                    var difference = estimatedXPNeeded - actualXPNeeded;
                    _currentCharacter.XPNeededToLevel = actualXPNeeded;
                    _currentCharacter.XPGained += difference;
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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

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
            if (_isNotifyingTells) {
                SendTextMessage(matches[1], matches[0]);
            }
        }
    } catch (caught) {
        var message = "Failure parsing for social: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function ParseForStatistics(incomingLine) {
    if (_currentCharacter === null) return;
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

            _currentCharacter.CurrentStrength = parseInt(matches[1]);
            _currentCharacter.MaxStrength = parseInt(matches[2]);
            _currentCharacter.CurrentIntelligence = parseInt(matches[3]);
            _currentCharacter.MaxIntelligence = parseInt(matches[4]);
            _currentCharacter.CurrentWill = parseInt(matches[5]);
            _currentCharacter.MaxWill = parseInt(matches[6]);
            _currentCharacter.CurrentDexterity = parseInt(matches[7]);
            _currentCharacter.MaxDexterity = parseInt(matches[8]);
            _currentCharacter.CurrentConstitution = parseInt(matches[9]);
            _currentCharacter.MaxConstitution = parseInt(matches[10]);
            _currentCharacter.CurrentLearningAbility = parseInt(matches[11]);
            _currentCharacter.MaxLearningAbility = parseInt(matches[12]);
        }
    } catch (caught) {
        var message = "Failure parsing for statistics: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

//*********************************************************************************************************************
//End Line Parsing
//*********************************************************************************************************************


//*********************************************************************************************************************
//Cascaded Events
//*********************************************************************************************************************

function OnAfkTimer() {
    jmc.Send("afk");
};

//Once this function is fired, send a command to the client indicating it is time to move.
function OnArkenMoveTimer() {
    jmc.Parse("lookRoom");
};

//Once this function is hit, turn itself off and re-engage the movement timer.
function OnArkenWaitTimer() {
    AutoArkenWaitTimer(false);
    AutoArkenMoveTimer(true);
};

function OnCharacterStatisticsTimer() {
    DisplayCharacterStatus();
};

function OnStatusTimer() {
    _isListeningForScore = true;
    jmc.Send("score");
};

//*********************************************************************************************************************
//Cascaded Events
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