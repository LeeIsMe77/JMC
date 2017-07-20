function ParseForGroupLine(incomingLine) {
	if (incomingLine == "" || new RegExp("(.)+>").test(incomingLine)) {
		_isListeningForGroup = false;
	}
	else {
		var matches = incomingLine.match(new RegExp("HP:(.)+S:(.)+ MV:(.)+ -- (.)+"));
		if (matches !== null && matches.length > 0) {
			var memberNameArray = matches[0].split("-- ");
			if (memberNameArray !== null && memberNameArray.length == 2) {
				var memberName = memberNameArray[1];
				var cleanName = CleanName(memberName);
				if (cleanName !== "") {
					if (_groupMembers.IndexOf(cleanName) === -1) {
						_groupMembers.Add(cleanName, memberName.indexOf(" (Head of group)") !== -1);
					}
				}
			}
		}
		jmc.DropEvent();
	}
}

function ParseForMutilate(incomingLine) {
	var memberName = "";

	var memberMutRegEx = incomingLine.match(new RegExp("([a-zA-Z]+) (MUTILATE)(.)+ with (his|her|its) deadly (.)+!!"));
	if (memberMutRegEx !== null && memberMutRegEx.length > 1) {
		memberName = memberMutRegEx[1];
	}
	else {
		var meMutRegEx = incomingLine.match(new RegExp("(.)*You MUTILATE (.)+ with your deadly (.)+!!"));
		if (meMutRegEx !== null && meMutRegEx.length > 0) {
			memberName = jmc.GetVar("me");
			jmc.ShowMe("Value of me: " + memberName);
		}
	}
	if (memberName == "" || _groupMembers.IndexOf(memberName) == -1) {
		return;
	}

	jmc.ShowMe("Mutilate registered by: " + memberName);
	_groupMembers.IncrementMutilateCount(memberName);
}

function ParseForMapLine(incomingLine, newMap) {

	if (incomingLine == "You do not see that here.") {
		_maps.Remove(newMap.MapName);
		jmc.DropEvent();
		jmc.ShowMe("Unrecognized map " + newMap.VariableName, "red");
		return false;
	}
	var indexOf = _maps.IndexOf(newMap.MapName);
	if (indexOf === -1) {
		jmc.ShowMe("Error adding map.");
		newMap = null;
		return true;
	}
	matches = incomingLine.match(new RegExp("([ .+-|V])+"));
	if (matches !== null && matches.length > 0) {
		newMap.Content.push(matches[0]);
		jmc.DropEvent();
		return true;
	}
	else if (incomingLine == "" || abortExpression.test(incomingLine)) {
		if (newMap.Content.length === 0) {
			_maps.Remove(newMap.MapName);
		}
		else {
			jmc.ShowMe("Map " + newMap.MapName + " has been added successfully.", "green");
			newMap.DisplayMap();
		}
		return false;
	}
}

function ParseForSkill(incomingLine) {
	if (new RegExp("(.)+>$").test(incomingLine)) {
		_isListeningForSkills = false;
	}
	else {
		var matches = incomingLine.match(new RegExp("([a-z A-Z]+) *\(([a-zA-Z]+)\).+"));
		if (matches !== null && matches.length > 0) {
			jmc.Output("Matches count: " + matches.length);
			for (var index = 0; index < matches.length; index++) {
				jmc.Output("Matches " + index + ": " + matches[index]);
			}
		}
		// jmc.DropEvent();
	}
}