//*********************************************************************************************************************
//Prototypes
//*********************************************************************************************************************
if (!String.prototype.cleanString) {
	String.prototype.cleanString = function () {
		return this
            //First, remove all byte order marks and ANSI color codes matching [30m or [0m pattern.
            .replace(/[\u001b]\[\d+m/g, '')
            //...and finally, strip off health status and right angle bracket at beginning of line, if it exists...
            .replace(/^R? ?(?:(?:Mind|Mount|HP|MV|S):[a-zA-Z ]+ ?)*(?:, [a-zA-Z,' ]+:[a-zA-Z ]+)*?>/, '')
		// .replace(/^(?:(?:HP|MV|S):[a-zA-Z]+ ?)+R?>/, '')
		//Original BOM/ANSI regex... no bueno.  Too many passes per line.
		//.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,'')
	}
}

String.prototype.endsWith = function (searchStr, Position) {
	// This works much better than >= because
	// it compensates for NaN:
	if (!(Position < this.length))
		Position = this.length;
	else
		Position |= 0; // round position
	return this.substr(Position - searchStr.length,
        searchStr.length) === searchStr;
};

if (!String.format) {
	String.format = function (format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(
            /{(\d+)}/g,
            function (match, number) {
            	return typeof args[number] != 'undefined' ?
                    args[number] :
                    match;
            }
        );
	};
}

String.prototype.startsWith = function (searchString, position) {
	return this.substr(position || 0, searchString.length) === searchString;
};

if (!String.prototype.toTitleCase) {
	String.prototype.toTitleCase = function () {
		return this.replace(
            /\w\S*/g,
            function (text) {
            	return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
            }
        );
	}
}

if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	}
}

if (!String.prototype.toFriendlyDateString) {
	Date.prototype.toFriendlyDateString = function () {
		var month = '' + (this.getMonth() + 1);
		var day = '' + this.getDate();
		var year = this.getFullYear();
		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;
		return [year, month, day].join('-');
	}
}

if (!String.prototype.capitalizeFirstLetter) {
	String.prototype.capitalizeFirstLetter = function () {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}
}
//*********************************************************************************************************************
//End Prototypes
//*********************************************************************************************************************



//*********************************************************************************************************************
//Logging
//*********************************************************************************************************************
var date = new Date();
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
var TIMER_CHARACTER_STATISTICS = 5;

//Output windows
var _socialOutputWindow = 1;
var _mapOutputWindow = 2;
var _skillOutputWindow = 3;
var _exitOutputWindow = 4;
var _damageReportOutputWindow = 5;
var _damageOutputWindow = 5;
var _rescueOutputWindow = 6;
var _characterStatusOutputWindow = 6;
var _exceptionOutputWindow = 9;

var _isListeningForRescue = false;
var _isListeningForScore = false;
var _isListeningForGroup = false;
var _isGroupFound = false;
var _isListeningForSkills = false;
var _isSkillsFound = false;
var _isScoreLineFound = false;
var _isListeningForAutoChill = false;

var _groupMembers = new GroupMemberCollection();
var _groupMembersTemp = new GroupMemberCollection();
var _maps = new MapCollection();
var _newMap = null;
var _skills = new SkillCollection(0);
var _currentPlayer = null;

var _farothExits = CreateFarothExits();
var _valeExits = CreateValeExits();

var _currentRoomName = "";
var _currentZone = ZoneTypes.None;
AutoCharacterStatus(true);
//*********************************************************************************************************************
//End Fields
//*********************************************************************************************************************



//*********************************************************************************************************************
//Toggles
//*********************************************************************************************************************
function AutoAfk(isEnabled) {
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
	} else {
		jmc.KillTimer(TIMER_ARKEN_MOVE);
	}
}

function AutoCharacterStatus(isEnabled) {
	if (isEnabled) {
		jmc.SetTimer(TIMER_CHARACTER_STATISTICS, 10);
		jmc.ShowMe("Auto Character Statistics is enabled.", "green");
	} else {
		jmc.KillTimer(TIMER_CHARACTER_STATISTICS);
		jmc.ShowMe("Auto Character Statistics is disabled.", "red");
	}
}

function AutoChill(isEnabled) {
	_isListeningForAutoChill = isEnabled;
	if (isEnabled) {
		jmc.ShowMe("Auto Chill Ray is enabled.", "green");
	} else {
		jmc.ShowMe("Auto Chill Ray is disabled.", "red");
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
		jmc.ShowMe("Auto Group Statistics is enabled.", "green");
	} else {
		jmc.KillTimer(TIMER_GROUP_STATISTICS);
		jmc.ShowMe("Auto Group Statistics is disabled.", "red");
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
		jmc.ShowMe("Rescue trigger is enabled.", "green");
	} else {
		jmc.ShowMe("Rescue trigger is disabled.", "red");
	}
}

function AutoStatus(isEnabled) {
	if (isEnabled) {
		jmc.SetTimer(TIMER_STATUS, 100);
		jmc.ShowMe("Auto status is enabled.", "green");
	} else {
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

		characterLine = "OB: " + _currentPlayer.OffensiveBonus + ", DB: " + _currentPlayer.DodgeBonus + ", PB: " + _currentPlayer.ParryBonus + ", Speed: " + _currentPlayer.AttackSpeed + ".";
		WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", false, false);

		characterLine = "Defense Sum: " + AnsiColors.ForegroundBrightBlue + _currentPlayer.DefenseSum() + ".";
		WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);

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


		var currentLevelPlusOne = parseInt(_currentPlayer.Level) + 1;
		var xpForLevel = (currentLevelPlusOne * currentLevelPlusOne * 1500) - (_currentPlayer.Level * _currentPlayer.Level * 1500)
		var xpColor = CalculateColor(xpForLevel - _currentPlayer.XPNeeded, xpForLevel);

		characterLine = "XP Needed To Level: " + xpColor + _currentPlayer.XPNeeded + AnsiColors.Default + ".";
		WriteToWindow(_characterStatusOutputWindow, characterLine, "normal", true, false);
	} catch (caught) {
		WriteExceptionToStream("Failure showing character status: " + caught);
		WriteToWindow(_mapOutputWindow, "Failure showing character status: " + caught, "red", true, true);
	}
}
//*********************************************************************************************************************
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
		for (var index = 0; index < _groupMembers.Count() ; index++) {
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
            function (a, b) {
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
	ParseForLogin(cleanLine);
	ParseForInformation(cleanLine);
	ParseForChillLine(cleanLine);
	ParseForMap(cleanLine);
	ParseForRescue(cleanLine);
	ParseForSocial(cleanLine);
	ParseForScoreLine(cleanLine);
	ParseForStatisticsLine(cleanLine);
	ParseForRoomName(cleanLine);
	ParseForGroupMember(cleanLine);
	ParseForGroupMemberDamage(cleanLine);
	ParseForGroupMemberMutilate(cleanLine);
	ParseForSkill(cleanLine);
	ParseForKill(cleanLine);
}

function ParseForKill(incomingLine) {
	if (_currentPlayer === null) return;
	if (incomingLine === "") return;
	if (incomingLine === "You feel more powerful!") {
		_currentPlayer.Level++;
		var currentLevelPlusOne = parseInt(_currentPlayer.Level) + 1;
		_currentPlayer.XPNeeded = (currentLevelPlusOne * currentLevelPlusOne * 1500) - (_currentPlayer.Level * _currentPlayer.Level * 1500)
		return;
	}

	var matches = incomingLine.match(/^You receive your share of experience -- (\d+) points\.$/);
	if (matches !== null) {
		_currentPlayer.XPNeeded = _currentPlayer.XPNeeded - parseInt(matches[1]);
		jmc.Send("get coin all.cor");
		return;
	}

	matches = incomingLine.match(/^Your spirit increases by (\d+)\.$/);
	if (matches !== null) {
		_currentPlayer.Spirit = _currentPlayer.Spirit + parseInt(matches[1]);
		return;
	}

	matches = incomingLine.match(/^You force your Will against [a-zA-Z '-]+'s concentration!$/);
	if (matches !== null) {
		_currentPlayer.Spirit += 2;
	}
}

function ParseForChillLine(incomingLine) {
	if (!_isListeningForAutoChill) return;

	if (incomingLine === "Your victim is not here!") return;
	if (incomingLine === "You could not concentrate anymore!" || incomingLine === "You lost your concentration!") {
		jmc.Send("cast chill");
		return;
	}

	var matches = incomingLine.match(/^[a-zA-Z\- ']+ shudders as your chill ray strikes (?:him|her|it).$/g);
	if (matches !== null) {
		jmc.Send("cast chill");
		return;
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
				for (var index = 0; index < _groupMembers.Count() ; index++) {
					var existingMemberName = _groupMembers.GroupMembers[index].MemberName;
					//If the member in temp does not exist....
					var memberInTemp = _groupMembersTemp.GetMember(existingMemberName);
					if (memberInTemp === null) {
						//Remove the member from the live collection.
						_groupMembers.Remove(existingMemberName);
					}
				}
				//Loop through all members in the new group member collection...
				for (var index = 0; index < _groupMembersTemp.Count() ; index++) {
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
					var memberName = matches[1].capitalizeFirstLetter();
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

function ParseForScoreLine(incomingLine) {
	if (_currentPlayer === null) return;
	try {

		//Perform a regex test on the incoming line to verify it is a score line...
		var matchesFound = false;
		var matches = incomingLine.match(/^You have ([0-9]+)\/([0-9]+) hit, ([0-9]+)\/([0-9]+) stamina, ([0-9]+)\/([0-9]+) moves, ([0-9]+) spirit\.$/);
		if (matches !== null) {
			matchesFound = true;
			_isScoreLineFound = true;
			_currentPlayer.CurrentHitPoints = matches[1];
			_currentPlayer.MaxHitPoints = matches[2];
			_currentPlayer.CurrentStamina = matches[3];
			_currentPlayer.MaxStamina = matches[4];
			_currentPlayer.CurrentMoves = matches[5];
			_currentPlayer.MaxMoves = matches[6];
			_currentPlayer.Spirit = matches[7];
		}

		if (!matchesFound && _isScoreLineFound) {
			matches = incomingLine.match(/^OB: (-?[\d]+), DB: (-?[\d]+), PB: (-?[\d]+), Speed: ([\d]+), Gold: ([\d]+), XP Needed: ([\d]+K?)\.$/);
			if (matches !== null) {
				matchesFound = true;
				_currentPlayer.OffensiveBonus = matches[1];
				_currentPlayer.DodgeBonus = matches[2];
				_currentPlayer.ParryBonus = matches[3];
				_currentPlayer.AttackSpeed = matches[4];

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
		WriteExceptionToStream(caught);
		WriteToWindow(_exceptionOutputWindow, "Failure parsing status line: " + caught, "red", true, true);
	}
}

//This function is used to process an incoming line from the MUD server for skills which are displayed from the "practice" command.
//Processing only occurs if _isListeningForSkills is set to "true".
function ParseForSkill(incomingLine) {
	//If not listening for skills, do not execute any code.
	if (!_isListeningForSkills) return;

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
	var matches = incomingLine.match(/^([a-z -]+) *\(([a-zA-Z ]+)\) *(?:\( *(\d+ time)(?:, *(\d+ (?:stamina|spirit)))?\))?$/);
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
}

function ParseForSocial(incomingLine) {
	try {
		var socialRegex = /^(?:[a-zA-Z]*) (chat|chats|narrate|narrates|tell|yell|yells|tells|sing|sings|say|says|group-say|group-says|petition|wiznet|wiznets|whispers)(?:[a-zA-Z, ]+)'(.*)'$/;
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
				case "yell":
					color = "red"
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

function ParseForStatisticsLine(incomingLine) {
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
		matches = incomingLine.match(/^Str: *(\d+)\/ *(\d+), Int: *(\d+)\/ *(\d+), Wil: *(\d+)\/ *(\d+), Dex: *(\d+)\/ *(\d+), Con: *(\d+)\/ *(\d+), Lea: *(\d+)\/ *(\d+)\.$/);
		if (matches !== null) {
			matchesFound = true;

			_currentPlayer.CurrentStrength = matches[1];
			_currentPlayer.MaxStrength = matches[2];
			_currentPlayer.CurrentIntelligence = matches[3];
			_currentPlayer.MaxIntelligence = matches[4];
			_currentPlayer.CurrentWill = matches[5];
			_currentPlayer.MaxWill = matches[6];
			_currentPlayer.CurrentDexterity = matches[7];
			_currentPlayer.MaxDexterity = matches[8];
			_currentPlayer.CurrentConstitution = matches[9];
			_currentPlayer.MaxConstitution = matches[10];
			_currentPlayer.CurrentLearningAbility = matches[11];
			_currentPlayer.MaxLearningAbility = matches[12];
		}
	} catch (caught) {
		WriteExceptionToStream(caught);
		WriteToWindow(_exceptionOutputWindow, "Failure parsing statistics line: " + caught, "red", true, true);
	}
}

//This function will process an incoming line for the text "Here we go..." and run whatever login commands are desired.
function ParseForLogin(incomingLine) {
	try {
		//This is a very easy function which will match an exact line and send the information command to the server.
		if (incomingLine === "") return;
		if (incomingLine === "Here we go..." || incomingLine === "Reconnecting.") {
			//Do Post-Login commands.
			jmc.Send("info");
			return;
		}

		var matches = incomingLine.match(/^[a-zA-Z -]+ stores your belongings and helps you into your private chamber\.$/);
		if (matches !== null) {
			_currentPlayer = null;
		}
	} catch (caught) {
		WriteExceptionToStream(caught);
		WriteToWindow(_exceptionOutputWindow, "Failure parsing login line: " + caught, "red", true, true);
	}
}

//This function will begin looking for an information return from the server, which consists of several lines which start with
//You or Your, with the oddball being Strength and Constitution.
function ParseForInformation(incomingLine) {
	try {
		//Right off the bat, run this regex.  He will set the _player object to a new instance.
		//You are Atomos test test ,.,12.398 test, an evil (-100) male Uruk-Lhuth.
		var matches = incomingLine.match(/^You are ([A-Za-z]*) .*, an? (?:good|evil|neutral) \((-?\d+)\) (male|female) ([a-zA-Z-]*)\.$/);
		if (matches !== null) {

			var playerName = matches[1];
			if (_currentPlayer === null || _currentPlayer.Name !== playerName) {
				jmc.Parse("#spit {Commands/Profiles/" + playerName + ".set} {%0} {ns}");
				jmc.Parse("blow eye");
				jmc.SetVar("me", playerName);
			}
			_currentPlayer = new Player(matches[1], matches[2], matches[3], matches[4]);
			return;
		}

		if (_currentPlayer === null) return;

		if (incomingLine.startsWith("You")) {

			//You have reached level 24.
			matches = incomingLine.match(/^You have reached level (\d+)\.$/);
			if (matches !== null) {
				_currentPlayer.Level = matches[1];
				return;
			}

			//You are level 4 Warrior, 3 Ranger, 7 Mystic, and 29 Mage.
			matches = incomingLine.match(/^You are level (\d+) Warrior, (\d+) Ranger, (\d+) Mystic, and (\d+) Mage\.$/);
			if (matches !== null) {
				_currentPlayer.WarriorLevel = matches[1];
				_currentPlayer.RangerLevel = matches[2];
				_currentPlayer.MysticLevel = matches[3];
				_currentPlayer.MageLevel = matches[4];
				return;
			}

			matches = incomingLine.match(/^You are specialized in ([a-z ]+)\.$/);
			if (matches !== null) {
				_currentPlayer.Specialization = matches[1].toTitleCase();
				return;
			}

			matches = incomingLine.match(/^You have (-?\d+)\/(\d+) hit points, (-?\d+)\/(\d+) stamina, (-?\d+)\/(\d+) moves and (-?\d+) spirit\.$/);
			if (matches !== null) {
				_currentPlayer.CurrentHitPoints = matches[1];
				_currentPlayer.MaxHitPoints = matches[2];
				_currentPlayer.CurrentStamina = matches[3];
				_currentPlayer.MaxStamina = matches[4];
				_currentPlayer.CurrentMoves = matches[5];
				_currentPlayer.MaxMoves = matches[6];
				_currentPlayer.Spirit = matches[7];
				return;
			}

			matches = incomingLine.match(/^Your OB is (-?\d+), dodge is (-?\d+), parry (-?\d+), and your attack speed is (-?\d+)\.$/);
			if (matches !== null) {
				_currentPlayer.OffensiveBonus = matches[1];
				_currentPlayer.DodgeBonus = matches[2];
				_currentPlayer.ParryBonus = matches[3];
				_currentPlayer.AttackSpeed = matches[4];
				return;
			}

			matches = incomingLine.match(/^You have scored (\d+) experience points, and need (\d+) more to advance\.$/);
			if (matches !== null) {
				_currentPlayer.XPNeeded = parseInt(matches[2]);
				return;
			}

		} else if (incomingLine.startsWith("Strength:")) {
			matches = incomingLine.match(/^Strength: (-?\d+)\/(\d+), Intelligence: (-?\d+)\/(\d+), Will: (-?\d+)\/(\d+), Dexterity: (-?\d+)\/(\d+)$/);
			if (matches !== null) {
				_currentPlayer.CurrentStrength = matches[1];
				_currentPlayer.MaxStrength = matches[2];
				_currentPlayer.CurrentIntelligence = matches[3];
				_currentPlayer.MaxIntelligence = matches[4];
				_currentPlayer.CurrentWill = matches[5];
				_currentPlayer.MaxWill = matches[6];
				_currentPlayer.CurrentDexterity = matches[7];
				_currentPlayer.MaxDexterity = matches[8];
				return;
			}

		} else if (incomingLine.startsWith("             Constitution:")) {
			matches = incomingLine.match(/^             Constitution: (-?\d+)\/(\d+), Learning Ability: (-?\d+)\/(\d+).$/);
			if (matches !== null) {
				_currentPlayer.CurrentConstitution = matches[1];
				_currentPlayer.MaxConstitution = matches[2];
				_currentPlayer.CurrentLearningAbility = matches[3];
				_currentPlayer.MaxLearningAbility = matches[4];
			}
		}
	} catch (caught) {
		WriteExceptionToStream(caught);
		WriteToWindow(_exceptionOutputWindow, "Failure parsing information line: " + caught, "red", true, true);
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
	jmc.Send("lookRoom");
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
	var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
	var errorLogFileName = "C:\\jmc\\3.7.1.1\\Logs\\Debug Logs\\Error - " + date.toFriendlyDateString() + ".txt";
	var errorStream = fileSystem.OpenTextFile(errorLogFileName, 8, true);
	errorStream.WriteLine(GetTimestamp() + ": " + caught);
}

function WriteSocialToStream(social) {
	// var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
	// var socialLogsFileName = "C:\\jmc\\3.7.1.1\\Logs\\Social Logs\\Social - " + date.toFriendlyDateString() + ".txt";
	// var socialStream = fileSystem.OpenTextFile(socialLogsFileName, 8, true);
	// socialStream.WriteLine(GetTimestamp() + ": " + social);
}

function GetTimestamp() {
	return new Date().toTimeString().substring(0, 8);
}

//*********************************************************************************************************************
//Writing to Windows and Status Bars
//*********************************************************************************************************************