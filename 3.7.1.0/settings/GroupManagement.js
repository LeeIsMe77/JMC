var _groupMembers = [];
function ClearGroup(){
    _groupMembers = [];
}

function AddMember(memberName){
    var cleanName = CleanName(memberName);
    if (cleanName == "") return;
    if (ContainsMember(cleanName)) return;

    var newMember = {
        Name:cleanName, 
        IsLeader:memberName.indexOf(" (Head of group)") !== -1
    };
    _groupMembers.push(newMember);
    var additionalMessage = "";
    if (newMember.IsLeader){
        additionalMessage = " (Leader)";
    }
    jmc.ShowMe(cleanName + additionalMessage + " has been added to the group.", "blue");
}

function ContainsMember(memberName){
    for (var index = 0; index < _groupMembers.length; index++){
        if (_groupMembers[index].Name === memberName){
            return true;
        }
    }
    return false;
}

function RetrieveLeader(){
    for (var index = 0; index < _groupMembers.length; index++){
        var currentMember = _groupMembers[index];        
        if (currentMember.IsLeader){
            return currentMember;
        }
    }
    return null;  
}

function RetrieveMember(memberName){    
    for (var index = 0; index < _groupMembers.length; index++){
        var currentMember = _groupMembers[index];        
        if (currentMember.Name === memberName){
            return currentMember;
        }
    }
    return null;    
}

function CleanName(memberName){
    var emptyString = "";
    if (memberName == null) return emptyString;
    memberName = memberName.replace(" (Head of group)", emptyString);
    if (memberName == "someone") return emptyString;
    if (memberName.indexOf(" ") !== -1) return emptyString;    
    return memberName;
}

function HealGroup(healingSpells, onlyLeader){
    if (healingSpells.length == 0){
        healingSpells = ["regeneration", "vitality", "curing", "insight"];
    }
    for (var index = 0; index < _groupMembers.length; index++){
        var currentMember = _groupMembers[index];
        if (onlyLeader && !currentMember.IsLeader) continue;
        jmc.ShowMe("Healing " + currentMember.Name);        
        for (var spellIndex = 0; spellIndex < healingSpells.length; spellIndex++){
            jmc.Send("cast '" + healingSpells[spellIndex] + "' " + currentMember.Name);
        }        
    }
}

function ListGroup(){
    var stringArray = new Array();
    for (var index = 0; index < _groupMembers.length; index++){
        var currentMember = _groupMembers[index];
        stringArray.push(MemberString(currentMember));
    }
    jmc.Send("gt Group Members: " + stringArray.join(", "));
}

function MemberString(groupMember){
    var message = groupMember.Name;
    if (groupMember.IsLeader){
        message = message + " (Leader)";
    }
    return message;
}