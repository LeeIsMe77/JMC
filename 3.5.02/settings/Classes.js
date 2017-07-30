
//*********************************************************************************************************************
//"Enums", or as close as we can get in javascript...
//*********************************************************************************************************************
ExitTypes = {
    Cave: "Cave",
    Entrance: "Entrance",
    Exit: "Exit",
    Mumak: "Mumak"
}

ZoneTypes = {
    None: "None",
    Faroth: "Faroth",
    Vale: "Vale"
}
//*********************************************************************************************************************
//End Enums
//*********************************************************************************************************************



//*********************************************************************************************************************
//Room Exit Classes
//*********************************************************************************************************************
function Exit(exitType, exitDirections){
    this.ExitType = exitType;
    this.ExitDirections = exitDirections;
}

function Room(roomName){
    this.RoomName = roomName;
    this.Exits = new Array();
    this.GetExit = function(exitType){
        for (var index = 0;index < this.Exits.length;index++){
            var exit = this.Exits[index];
            if (exit.ExitType === exitType){
                return exit;
            }
        }
        return null;
    }
    this.GetExitString = function(){
        var exits = []
        for (var index = 0;index < this.Exits.length;index++){
            var exit = this.Exits[index];
            exits.push(exit.ExitType + ":" + exit.ExitDirections);
        }
        return exits.join(" | ");
    }
}

function Zone(zoneType){
    this.ZoneType = zoneType;
    this.Rooms = new Array();
    this.GetRoom = function(roomName){
        if (roomName === "") return null;
        for (var index = 0;index < this.Rooms.length;index++){
            var room = this.Rooms[index];
            if (room.RoomName === roomName){
                return room;
            }
        }
        return null;
    }
}
//*********************************************************************************************************************
//End Room Exit Classes
//*********************************************************************************************************************



//*********************************************************************************************************************
//Mapping Classes
//*********************************************************************************************************************
function Map(mapName, variableName){    
    this.Content = new Array();
    this.MapName = mapName;
    this.VariableName = variableName;
}

function MapCollection() {
    this.Maps = new Array();
    
    //Add a map to the maps collection.    
    this.Add = function(mapName, variableName){
        if (mapName === "") throw "The map name cannot be blank.";
        if (variableName === "") throw "The variable name cannot be blank."
        if (this.IndexOf(mapName) !== -1) throw "Map name " + mapName + " already exists.";        
        var map = new Map(mapName, variableName);
        this.Maps.push(map);
        return map;
    }

    //Resets the maps collection.
    this.Clear = function() {
        this.Maps = new Array();
    };
        
    this.Count = function(){
        return this.Maps.length;
    }
    
    //Retrieve the map from the maps collection by the specified map name.
    this.GetMap = function(mapName){
        for (var index = 0;index < this.Maps.length;index++){
            var currentMap = this.Maps[index];        
            if (currentMap.MapName === mapName){
                return currentMap;
            }
        }
        return null;
    }

    this.GetMapByIndex = function(index) {
        if (index >= -1) throw "Index must be greater than or equal to 0.";
        if (index >= this.Maps.length) throw "Index is outside the bounds of the map collection."
        return this.Maps[index];
    }
    
    //Retrieve the ordinal index of a map name in the maps collection.
    this.IndexOf = function(mapName){
        for (var index = 0;index < this.Maps.length;index++){
            var currentMap = this.Maps[index];        
            if (currentMap.MapName === mapName){
                return index;
            }
        }
        return -1;
    }
    
    //Remove a map from the map collection.
    this.Remove = function(mapName){
        var index = this.IndexOf(mapName);
        if (index === -1) throw "Map name " + mapName + " does not exist in the map collection.";
        this.Maps.splice(index, 1);
    }
}
//*********************************************************************************************************************
//End Mapping Classes
//*********************************************************************************************************************



//*********************************************************************************************************************
//Skill Classes
//*********************************************************************************************************************
function Skill(skillName, skillLevel, time, cost){    
    this.SkillName = skillName;
    this.SkillLevel = skillLevel;
    this.Time = time;
    this.Cost = cost;
}

function SkillCollection() {
    
    this.Skills = new Array();
    
    //Add a skill to the skills collection.
    this.Add = function(skillName, skillLevel, time, cost){
        if (this.IndexOf(skillName) !== -1) return;
        var skill = new Skill(skillName, skillLevel, time, cost);
        this.Skills.push(skill);
        return skill;
    }

    //Resets the skills collection.
    this.Clear = function() {
        this.Skills = new Array();
    };

    this.Count = function(){
        return this.Skills.length;
    }
    
    //Retrieve the skill from the skills collection by the specified skill name.
    this.GetSkill = function(skillName){
        for (var index = 0;index < this.Skills.length;index++){
            var currentSkill = this.Skills[index];        
            if (currentSkill.SkillName === skillName){
                return currentSkill;
            }
        }
        return null;
    }
    
    //Retrieve the ordinal index of a skill name in the skills collection.
    this.IndexOf = function(skillName){
        for (var index = 0;index < this.Skills.length;index++){
            var currentSkill = this.Skills[index];        
            if (currentSkill.SkillName === skillName){
                return index;
            }
        }
        return -1;
    }
    
    //Remove a skill from the skill collection.
    this.Remove = function(skillName){
        var index = this.IndexOf(skillName);
        if (index !== -1){
            this.Skills.splice(index, 1);
        }
    }
}
//*********************************************************************************************************************
//End Skill Classes
//*********************************************************************************************************************



//*********************************************************************************************************************
//Group Classes
//*********************************************************************************************************************
function GroupMember(memberName, isLeader){
    this.MemberName = memberName;
    this.IsLeader = isLeader;
    this.MutilateCount = 0;
    this.FriendlyName = function(){
        if (this.IsLeader){
            return this.MemberName + " (Leader)";
        }
        return this.MemberName;
    }
    this.IncrementMutilateCount = function(){
        this.MutilateCount++;
    }
    this.ClearMutilates = function(){
        this.MutilateCount = 0;
    }
}


function GroupMemberCollection(){
    
    this.GroupMembers = new Array();

    //Add a member to the group members collection.
    this.Add = function(memberName, isLeader){
        var groupMember = new GroupMember(memberName, isLeader);
        this.GroupMembers.push(groupMember);
        jmc.ShowMe(groupMember.FriendlyName() + " has been added to the group.", "blue");
        return groupMember;
    }

    //Resets the group members collection.
    this.Clear = function() {
        this.GroupMembers = [];
    };

    this.Count = function(){
        return this.GroupMembers.length;
    }
    
    //Retrieve the member from the group members collection by the specified group member name.
    this.GetMember = function(memberName){
        for (var index = 0;index < this.GroupMembers.length;index++){
            var currentMember = this.GroupMembers[index];        
            if (currentMember.MemberName === memberName){
                return currentMember;
            }
        }
        return null;
    }
    
    //Retrieve the ordinal index of a member name in the group members collection.
    this.IndexOf = function(memberName){
        for (var index = 0;index < this.GroupMembers.length;index++){
            var currentMember = this.GroupMembers[index];        
            if (currentMember.MemberName === memberName){
                return index;
            }
        }
        return -1;
    }
    
    //List all group member names in a comma delimited format.
    this.ListMembers = function(){
        var stringArray = new Array();
        for (var index = 0; index < this.Count(); index++){
            var currentMember = this.GroupMembers[index];
            stringArray.push(currentMember.FriendlyName());
        }
        return stringArray.join(", ");
    }
    
    //Remove a member from the group member collection.
    this.Remove = function(memberName){
        var index = this.IndexOf(memberName);
        if (index !== -1){
            var groupMemberName = this.GroupMembers[index].FriendlyName();        
            this.GroupMembers.splice(index, 1);
            jmc.ShowMe(groupMemberName + " has been added to the group.", "blue");
        }
    }

    this.ListMutilates = function(){
        jmc.Send("gt Mutilate Statistics:")
        for (var index = 0;index < this.GroupMembers.length;index++){
            var currentMember = this.GroupMembers[index];        
            jmc.Send("gt " + currentMember.MemberName + ": " + currentMember.MutilateCount);
        }
    }

    this.IncrementMutilateCount = function(memberName){
        var index = this.IndexOf(memberName);
        if (index === -1) return;
        this.GroupMembers[index].IncrementMutilateCount();
    }
}
//*********************************************************************************************************************
//Group Classes
//*********************************************************************************************************************

function CreateValeExits(){
        
    var zone = new Zone("Vale");
    var room;
    var exit;
    room = new Room("A Bald Boulder");
    exit = new Exit(ExitTypes.Entrance, "ensesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Break in the Forest");
    exit = new Exit(ExitTypes.Entrance, "nnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "e");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Busy Place");
    exit = new Exit(ExitTypes.Entrance, "new");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Creepy Thicket");
    exit = new Exit(ExitTypes.Entrance, "wsssnesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "nnesew");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Dark Copse");
    exit = new Exit(ExitTypes.Entrance, "wnnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Dark Track");
    exit = new Exit(ExitTypes.Entrance, "wnesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Deep Depression");
    exit = new Exit(ExitTypes.Entrance, "wwewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Gruesome Scene");
    exit = new Exit(ExitTypes.Entrance, "sesnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Large Depression");
    exit = new Exit(ExitTypes.Entrance, "sesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Musty Smell");
    exit = new Exit(ExitTypes.Entrance, "nwssw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Narrow Run");
    exit = new Exit(ExitTypes.Entrance, "ewnesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Rocky Outcrop");
    exit = new Exit(ExitTypes.Entrance, "enwsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Rotting Windfall");
    exit = new Exit(ExitTypes.Entrance, "wsnnnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Small Clearing");
    exit = new Exit(ExitTypes.Entrance, "nssnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Small Knoll");
    exit = new Exit(ExitTypes.Entrance, "nsenenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Small Spring");
    exit = new Exit(ExitTypes.Entrance, "nnnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Stagnant Odor");
    exit = new Exit(ExitTypes.Entrance, "nsnsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Strange Barrow");
    exit = new Exit(ExitTypes.Entrance, "nwwwww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Strange Vapour");
    exit = new Exit(ExitTypes.Entrance, "esw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Stray Boulder");
    exit = new Exit(ExitTypes.Entrance, "sewnnsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Tragic Scene");
    exit = new Exit(ExitTypes.Entrance, "ssnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "eeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Turn");
    exit = new Exit(ExitTypes.Entrance, "wsesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Accursed Vale");
    exit = new Exit(ExitTypes.Entrance, "nwsew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("An Ancient Ossuary");
    exit = new Exit(ExitTypes.Entrance, "wesnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("An Inverted Forest");
    exit = new Exit(ExitTypes.Entrance, "wsew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("An Old Camp");
    exit = new Exit(ExitTypes.Entrance, "wwesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Another Dead End");
    exit = new Exit(ExitTypes.Entrance, "sssnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "seeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Ash Pit");
    exit = new Exit(ExitTypes.Entrance, "nnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Baleful Darkness");
    exit = new Exit(ExitTypes.Entrance, "ennnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Bearded Old Man");
    exit = new Exit(ExitTypes.Entrance, "newnnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Black Ferns");
    exit = new Exit(ExitTypes.Entrance, "ewwnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Black Vines");
    exit = new Exit(ExitTypes.Entrance, "eesnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Black Wood");
    exit = new Exit(ExitTypes.Entrance, "nwesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Bleeding Trees");
    exit = new Exit(ExitTypes.Entrance, "sewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Bog of Darkness");
    exit = new Exit(ExitTypes.Entrance, "wwesewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Brackish Waters");
    exit = new Exit(ExitTypes.Entrance, "wnnsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Breathing Forest");
    exit = new Exit(ExitTypes.Entrance, "ssnennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Broken Land");
    exit = new Exit(ExitTypes.Entrance, "snnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Broken Rocks");
    exit = new Exit(ExitTypes.Entrance, "wesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Brothel of Trees");
    exit = new Exit(ExitTypes.Entrance, "nnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Change in Course");
    exit = new Exit(ExitTypes.Entrance, "nnnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Charred Trees");
    exit = new Exit(ExitTypes.Entrance, "esew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Choked Path");
    exit = new Exit(ExitTypes.Entrance, "nsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Churning Trees");
    exit = new Exit(ExitTypes.Entrance, "wensnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Circle of Trees");
    exit = new Exit(ExitTypes.Entrance, "sew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Cluster of Oaks");
    exit = new Exit(ExitTypes.Entrance, "snesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Conic Mushrooms");
    exit = new Exit(ExitTypes.Entrance, "ssnenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Corrupt Trees");
    exit = new Exit(ExitTypes.Entrance, "nsesnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Crowded Forest Floor");
    exit = new Exit(ExitTypes.Entrance, "nsnenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Crowded Path");
    exit = new Exit(ExitTypes.Entrance, "swnwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Cul De Sac");
    exit = new Exit(ExitTypes.Entrance, "wennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Curving Path");
    exit = new Exit(ExitTypes.Entrance, "snewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Damp Woods");
    exit = new Exit(ExitTypes.Entrance, "eeesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Dense Forest");
    exit = new Exit(ExitTypes.Entrance, "wessesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Forest Continues");
    exit = new Exit(ExitTypes.Entrance, "essnenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "esene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Forest Path");
    exit = new Exit(ExitTypes.Entrance, "snsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Green Moss");
    exit = new Exit(ExitTypes.Entrance, "nww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "nwnneeseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Halls");
    exit = new Exit(ExitTypes.Entrance, "nsesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Hollow");
    exit = new Exit(ExitTypes.Entrance, "nnsewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Massive Forest");
    exit = new Exit(ExitTypes.Entrance, "ssesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Pit");
    exit = new Exit(ExitTypes.Entrance, "nennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Putrid Waters");
    exit = new Exit(ExitTypes.Entrance, "ssesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Valley Forest");
    exit = new Exit(ExitTypes.Entrance, "nenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Darkling Path");
    exit = new Exit(ExitTypes.Entrance, "wenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Darkness");
    exit = new Exit(ExitTypes.Entrance, "wnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dead Trees");
    exit = new Exit(ExitTypes.Entrance, "esewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Decaying Marsh");
    exit = new Exit(ExitTypes.Entrance, "nwnnsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Deep in the Swamp");
    exit = new Exit(ExitTypes.Entrance, "ennsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Deep Moss");
    exit = new Exit(ExitTypes.Entrance, "nwsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Deep Waters");
    exit = new Exit(ExitTypes.Entrance, "eennsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dense Brush");
    exit = new Exit(ExitTypes.Entrance, "eeessesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dense Dark Woodland");
    exit = new Exit(ExitTypes.Entrance, "nesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dense Underbrush");
    exit = new Exit(ExitTypes.Entrance, "wnnsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dim Vale");
    exit = new Exit(ExitTypes.Entrance, "snnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dire Trees");
    exit = new Exit(ExitTypes.Entrance, "esssnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "eseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Distrubing Noises");
    exit = new Exit(ExitTypes.Entrance, "ssnesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Disturbing Undergrowth");
    exit = new Exit(ExitTypes.Entrance, "nnsssnesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Drier Marshland");
    exit = new Exit(ExitTypes.Entrance, "eewsesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Drifting Track");
    exit = new Exit(ExitTypes.Entrance, "eewsesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dripping Moss");
    exit = new Exit(ExitTypes.Entrance, "wsnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "eenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dusky Wood");
    exit = new Exit(ExitTypes.Entrance, "eessesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dusty Hollow");
    exit = new Exit(ExitTypes.Entrance, "ennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dusty Smell");
    exit = new Exit(ExitTypes.Entrance, "sewwnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Eerie Marsh");
    exit = new Exit(ExitTypes.Entrance, "ssnnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Endless Path");
    exit = new Exit(ExitTypes.Entrance, "ennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Entrance to Path");
    exit = new Exit(ExitTypes.Entrance, "eesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Entrance to the Hidden Vale");
    exit = new Exit(ExitTypes.Entrance, "");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "enneeseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Eryn Lome");
    exit = new Exit(ExitTypes.Entrance, "snennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Eryn Wethrin");
    exit = new Exit(ExitTypes.Entrance, "esnennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Faint Path");
    exit = new Exit(ExitTypes.Entrance, "esnennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Fallen Leaves");
    exit = new Exit(ExitTypes.Entrance, "snwsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Fallen Trees");
    exit = new Exit(ExitTypes.Entrance, "snww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("False Hope");
    exit = new Exit(ExitTypes.Entrance, "nnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Flooded Forest");
    exit = new Exit(ExitTypes.Entrance, "snnnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest Guardians");
    exit = new Exit(ExitTypes.Entrance, "nsewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest Ledge");
    exit = new Exit(ExitTypes.Entrance, "senenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest of Despair");
    exit = new Exit(ExitTypes.Entrance, "nnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest of Endless Night");
    exit = new Exit(ExitTypes.Entrance, "ewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Game Trail");
    exit = new Exit(ExitTypes.Entrance, "ewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "eneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Ghastly Trees");
    exit = new Exit(ExitTypes.Entrance, "nesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Giant Ancient Trees");
    exit = new Exit(ExitTypes.Entrance, "nnnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "ne");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Gleaming Eyes");
    exit = new Exit(ExitTypes.Entrance, "snenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "ene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Gloomy Trees");
    exit = new Exit(ExitTypes.Entrance, "esnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Grasping Thorns");
    exit = new Exit(ExitTypes.Entrance, "wwnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Hairy Trees");
    exit = new Exit(ExitTypes.Entrance, "esew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Heartless Trees");
    exit = new Exit(ExitTypes.Entrance, "wnnwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Hedge of Thorns");
    exit = new Exit(ExitTypes.Entrance, "sessesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("High Up In a Tree");
    exit = new Exit(ExitTypes.Entrance, "dnnnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Hollow Tree");
    exit = new Exit(ExitTypes.Entrance, "nsew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Inky Forest");
    exit = new Exit(ExitTypes.Entrance, "wnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Inside the Cave");
    exit = new Exit(ExitTypes.Entrance, "sewwesewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Into the Swamp");
    exit = new Exit(ExitTypes.Entrance, "ennsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Leaving the Hidden Vale");
    exit = new Exit(ExitTypes.Entrance, "wnnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Leaving the Swamp");
    exit = new Exit(ExitTypes.Entrance, "sesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Lords of the Night");
    exit = new Exit(ExitTypes.Entrance, "esswnwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Lost Amongst the Giants");
    exit = new Exit(ExitTypes.Entrance, "wnnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Lost in the Valley");
    exit = new Exit(ExitTypes.Entrance, "ensesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Malevolent Pines");
    exit = new Exit(ExitTypes.Entrance, "ensnsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Massive Oaks");
    exit = new Exit(ExitTypes.Entrance, "enw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Mat of Death");
    exit = new Exit(ExitTypes.Entrance, "enwesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Maze of Bracken");
    exit = new Exit(ExitTypes.Entrance, "nsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Mirkwood");
    exit = new Exit(ExitTypes.Entrance, "snnsew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Mist");
    exit = new Exit(ExitTypes.Entrance, "wesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Mist Covered Bog");
    exit = new Exit(ExitTypes.Entrance, "newennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Moist Breeze");
    exit = new Exit(ExitTypes.Entrance, "eewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Moody Trees");
    exit = new Exit(ExitTypes.Entrance, "nwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Mosquito Infested Waters");
    exit = new Exit(ExitTypes.Entrance, "nsnnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Mossy Trees");
    exit = new Exit(ExitTypes.Entrance, "ewnnwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Motionless Swamp");
    exit = new Exit(ExitTypes.Entrance, "nnsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Muddy Path");
    exit = new Exit(ExitTypes.Entrance, "wwww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Murky Waters");
    exit = new Exit(ExitTypes.Entrance, "eeennsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Obsidian Wood");
    exit = new Exit(ExitTypes.Entrance, "enenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Old Forest");
    exit = new Exit(ExitTypes.Entrance, "ewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("On Spongy Ground");
    exit = new Exit(ExitTypes.Entrance, "ewnnsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Opaque Darkness");
    exit = new Exit(ExitTypes.Entrance, "esesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Oppressive Feeling");
    exit = new Exit(ExitTypes.Entrance, "www");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Outside a Cave");
    exit = new Exit(ExitTypes.Entrance, "ewwesewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Overt Malice");
    exit = new Exit(ExitTypes.Entrance, "nnwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Pale Mist");
    exit = new Exit(ExitTypes.Entrance, "ew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Pale Shroud");
    exit = new Exit(ExitTypes.Entrance, "ensnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Patch of Mushrooms");
    exit = new Exit(ExitTypes.Entrance, "wwnew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Pressing Darkness");
    exit = new Exit(ExitTypes.Entrance, "nensnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Quiet Corner");
    exit = new Exit(ExitTypes.Entrance, "essesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Random Stones");
    exit = new Exit(ExitTypes.Entrance, "newenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Reaching Branches");
    exit = new Exit(ExitTypes.Entrance, "wssw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Returning to the Forest");
    exit = new Exit(ExitTypes.Entrance, "wenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "eeseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Ring of Stones");
    exit = new Exit(ExitTypes.Entrance, "ssnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rising Forest");
    exit = new Exit(ExitTypes.Entrance, "newennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rocky Forest Floor");
    exit = new Exit(ExitTypes.Entrance, "esnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rotting Beeches");
    exit = new Exit(ExitTypes.Entrance, "wnew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rotting Treestump");
    exit = new Exit(ExitTypes.Entrance, "nsesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Row of Elms");
    exit = new Exit(ExitTypes.Entrance, "ww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "wnneeseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Scarred Land");
    exit = new Exit(ExitTypes.Entrance, "sswnwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sea of Trees");
    exit = new Exit(ExitTypes.Entrance, "sesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Shadowy Hues");
    exit = new Exit(ExitTypes.Entrance, "wsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Shallow Waters");
    exit = new Exit(ExitTypes.Entrance, "wennsnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sharp Spears");
    exit = new Exit(ExitTypes.Entrance, "nwwesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Shifting Trees");
    exit = new Exit(ExitTypes.Entrance, "nnnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sickly Forest");
    exit = new Exit(ExitTypes.Entrance, "nnsnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Silent Arena");
    exit = new Exit(ExitTypes.Entrance, "nsessesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Silent Trees");
    exit = new Exit(ExitTypes.Entrance, "snnnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sleeping Forest");
    exit = new Exit(ExitTypes.Entrance, "eswwww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Slushy Ground");
    exit = new Exit(ExitTypes.Entrance, "snwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Smell of Decay");
    exit = new Exit(ExitTypes.Entrance, "wewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Snare of Pines");
    exit = new Exit(ExitTypes.Entrance, "ssnenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "sene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Solid Ground Once Again");
    exit = new Exit(ExitTypes.Entrance, "nnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Split Path");
    exit = new Exit(ExitTypes.Entrance, "wnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Spongy Ground");
    exit = new Exit(ExitTypes.Entrance, "sssesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Strange Lights");
    exit = new Exit(ExitTypes.Entrance, "nwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "neeseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Strange Marsh");
    exit = new Exit(ExitTypes.Entrance, "snnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Strangled Forest");
    exit = new Exit(ExitTypes.Entrance, "eswwww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sunken Path");
    exit = new Exit(ExitTypes.Entrance, "wennnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Surreal Forest");
    exit = new Exit(ExitTypes.Entrance, "ennww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Taur-e-Duath");
    exit = new Exit(ExitTypes.Entrance, "nesnennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Taur-nu-Fuin");
    exit = new Exit(ExitTypes.Entrance, "wesewenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Taur-nu-Morna");
    exit = new Exit(ExitTypes.Entrance, "sw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("The Barrier");
    exit = new Exit(ExitTypes.Entrance, "sssnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("The Channel");
    exit = new Exit(ExitTypes.Entrance, "ewnnewennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("The Dark Wood");
    exit = new Exit(ExitTypes.Entrance, "swesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("The Great Pine");
    exit = new Exit(ExitTypes.Entrance, "esnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("The Ground Grows Soft");
    exit = new Exit(ExitTypes.Entrance, "nnnenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("The Path");
    exit = new Exit(ExitTypes.Entrance, "wnwenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thick Bramble");
    exit = new Exit(ExitTypes.Entrance, "ewnnww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thick Underbrush");
    exit = new Exit(ExitTypes.Entrance, "nnenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thick, Dark Forest");
    exit = new Exit(ExitTypes.Entrance, "sennww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thin Trail On Hill");
    exit = new Exit(ExitTypes.Entrance, "w");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "nneeseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thundering Darkness");
    exit = new Exit(ExitTypes.Entrance, "nssnenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Timeless Trees");
    exit = new Exit(ExitTypes.Entrance, "snenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Tortured Land");
    exit = new Exit(ExitTypes.Entrance, "swesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Twisted Pines");
    exit = new Exit(ExitTypes.Entrance, "sssnesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Twisted Trail");
    exit = new Exit(ExitTypes.Entrance, "nessnenw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "nesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Unclimbable Cliff");
    exit = new Exit(ExitTypes.Entrance, "swwww");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Unkempt Forest");
    exit = new Exit(ExitTypes.Entrance, "nw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "nnneeseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Vigilent Forest");
    exit = new Exit(ExitTypes.Entrance, "wennw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "neenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Weaving Mists");
    exit = new Exit(ExitTypes.Entrance, "nsssnesw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("West of the Thicket");
    exit = new Exit(ExitTypes.Entrance, "nswesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Whispering Pines");
    exit = new Exit(ExitTypes.Entrance, "wewnesew");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Exit, "");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    return zone;
}

//*********************************************************************************************************************
//Create Faroth Exits
//*********************************************************************************************************************
function CreateFarothExits(){

    var zone = new Zone(ZoneTypes.Faroth);
    var room = new Room("A Bleached Skeleton");
    var exit = new Exit(ExitTypes.Entrance, "wsnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Clear Spring");
    exit = new Exit(ExitTypes.Entrance, "weswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Frightening Warning");
    exit = new Exit(ExitTypes.Entrance, "wsnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Gushing Spring");
    exit = new Exit(ExitTypes.Entrance, "nssssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Lazy Waterfall");
    exit = new Exit(ExitTypes.Entrance, "seswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Low Riverbank");
    exit = new Exit(ExitTypes.Entrance, "eewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Shallow Bog");
    exit = new Exit(ExitTypes.Entrance, "nwwen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wsnwesnsn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("A Stone Quarry");
    exit = new Exit(ExitTypes.Entrance, "swnwwsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Abused Woods");
    exit = new Exit(ExitTypes.Entrance, "ennnswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "sn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Alter of Bones");
    exit = new Exit(ExitTypes.Entrance, "snnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Ancient Trees");
    exit = new Exit(ExitTypes.Entrance, "nswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Bed of Stones");
    exit = new Exit(ExitTypes.Entrance, "ewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Before a Cave");
    exit = new Exit(ExitTypes.Entrance, "wneen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Bending River");
    exit = new Exit(ExitTypes.Entrance, "ewnsnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Between Cliffs");
    exit = new Exit(ExitTypes.Entrance, "ewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Blackened Rocks");
    exit = new Exit(ExitTypes.Entrance, "wnwwsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Break in the Trees");
    exit = new Exit(ExitTypes.Entrance, "n");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wswwnnwnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "wnwnwnnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Broad Depression");
    exit = new Exit(ExitTypes.Entrance, "snnnswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wnwnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Broad Forest Trail");
    exit = new Exit(ExitTypes.Entrance, "nswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Broadening River");
    exit = new Exit(ExitTypes.Entrance, "neewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Broken Earth");
    exit = new Exit(ExitTypes.Entrance, "esnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Bundles of Trees");
    exit = new Exit(ExitTypes.Entrance, "wesesneewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Burnt Trees");
    exit = new Exit(ExitTypes.Entrance, "essnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Burrowing Trails");
    exit = new Exit(ExitTypes.Entrance, "nwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Buzzing Woods");
    exit = new Exit(ExitTypes.Entrance, "swewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Calm River");
    exit = new Exit(ExitTypes.Entrance, "wneewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Circle of Maples");
    exit = new Exit(ExitTypes.Entrance, "snewwen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wwwnwnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Circle of Rocks");
    exit = new Exit(ExitTypes.Entrance, "wennswewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Clear River");
    exit = new Exit(ExitTypes.Entrance, "esneewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Clearing in the Woods");
    exit = new Exit(ExitTypes.Entrance, "nssssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Confined Feeling");
    exit = new Exit(ExitTypes.Entrance, "nnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Coniferous Trees");
    exit = new Exit(ExitTypes.Entrance, "newsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Crowded Foliage");
    exit = new Exit(ExitTypes.Entrance, "ennswewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Crumbling Woods");
    exit = new Exit(ExitTypes.Entrance, "enssssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Crushed Trees");
    exit = new Exit(ExitTypes.Entrance, "eewsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Cursed Woods");
    exit = new Exit(ExitTypes.Entrance, "snnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Damp Forest Floor");
    exit = new Exit(ExitTypes.Entrance, "esen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wwnnwnw");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dancing Eyes");
    exit = new Exit(ExitTypes.Entrance, "wwnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Dreary Forest");
    exit = new Exit(ExitTypes.Entrance, "sssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark Forest Path");
    exit = new Exit(ExitTypes.Entrance, "nssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark River Waters");
    exit = new Exit(ExitTypes.Entrance, "nnweewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dark and Dreadful Forest");
    exit = new Exit(ExitTypes.Entrance, "wesen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dead Trees");
    exit = new Exit(ExitTypes.Entrance, "nwwsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Deafening Current");
    exit = new Exit(ExitTypes.Entrance, "weewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Decorative Skeletons");
    exit = new Exit(ExitTypes.Entrance, "esnnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Decrepit Shack");
    exit = new Exit(ExitTypes.Entrance, "nsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Deep Dark Pond");
    exit = new Exit(ExitTypes.Entrance, "eneen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Deepening River");
    exit = new Exit(ExitTypes.Entrance, "seewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Deepening Waters");
    exit = new Exit(ExitTypes.Entrance, "esneewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dense Canopy");
    exit = new Exit(ExitTypes.Entrance, "enwewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dimly-lit Woods");
    exit = new Exit(ExitTypes.Entrance, "ewewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Disappearing Trail");
    exit = new Exit(ExitTypes.Entrance, "sssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Dry Forest");
    exit = new Exit(ExitTypes.Entrance, "ssssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Echo of Silence");
    exit = new Exit(ExitTypes.Entrance, "eensewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Eerie Vapors");
    exit = new Exit(ExitTypes.Entrance, "nnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Endless Trees");
    exit = new Exit(ExitTypes.Entrance, "ewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Entrance to the Hidden Vale");
    exit = new Exit(ExitTypes.Entrance, "enneeseeneenesene");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Eryn Lasgalien");
    exit = new Exit(ExitTypes.Entrance, "ensewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Eryn Vorn");
    exit = new Exit(ExitTypes.Entrance, "wsnwnnswewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Eternal Darkness");
    exit = new Exit(ExitTypes.Entrance, "wewewen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "snsn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Faint Forest Trail");
    exit = new Exit(ExitTypes.Entrance, "ewsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Fallen Logs");
    exit = new Exit(ExitTypes.Entrance, "ewsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Fields of Death");
    exit = new Exit(ExitTypes.Entrance, "nenwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Fiery Forest");
    exit = new Exit(ExitTypes.Entrance, "nwwewwen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nwesnsn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Flowerless Fields");
    exit = new Exit(ExitTypes.Entrance, "swsewnssen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "w");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Foggy Woods");
    exit = new Exit(ExitTypes.Entrance, "nsnwnnswewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest Loops");
    exit = new Exit(ExitTypes.Entrance, "ssnssen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nsn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest of Dawn");
    exit = new Exit(ExitTypes.Entrance, "wwewwen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wesnsn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest of Despair");
    exit = new Exit(ExitTypes.Entrance, "wnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest of Shadows");
    exit = new Exit(ExitTypes.Entrance, "snsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest of Thorns");
    exit = new Exit(ExitTypes.Entrance, "nwnnwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forest of Twilight");
    exit = new Exit(ExitTypes.Entrance, "sesneewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forested Valley");
    exit = new Exit(ExitTypes.Entrance, "nnewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Forsaken Forest");
    exit = new Exit(ExitTypes.Entrance, "nsssnsswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "nnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Fresh Droppings");
    exit = new Exit(ExitTypes.Entrance, "nwewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Furry Trees");
    exit = new Exit(ExitTypes.Entrance, "wnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Game Trail");
    exit = new Exit(ExitTypes.Entrance, "wwsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Gloomy Woods");
    exit = new Exit(ExitTypes.Entrance, "snssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Glowing Eyes");
    exit = new Exit(ExitTypes.Entrance, "wnnwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Golden Leaves");
    exit = new Exit(ExitTypes.Entrance, "wnwewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Grassy Knoll");
    exit = new Exit(ExitTypes.Entrance, "nnenwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Heart of Darkness");
    exit = new Exit(ExitTypes.Entrance, "ssnssen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wnw");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Holly Bushes");
    exit = new Exit(ExitTypes.Entrance, "ennnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Hot Geysers");
    exit = new Exit(ExitTypes.Entrance, "wssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Imprinted Tracks");
    exit = new Exit(ExitTypes.Entrance, "ewnwewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Intersecting Trails");
    exit = new Exit(ExitTypes.Entrance, "nnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Intimidating Trees");
    exit = new Exit(ExitTypes.Entrance, "snssssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Jagged Rocks");
    exit = new Exit(ExitTypes.Entrance, "wessnssen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nwwwnwnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Kill Site");
    exit = new Exit(ExitTypes.Entrance, "nnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Layers of Leaves");
    exit = new Exit(ExitTypes.Entrance, "nnssssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Leaving the Forest");
    exit = new Exit(ExitTypes.Entrance, "");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "swswwnnwnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "swnwnwnnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Leaving the River");
    exit = new Exit(ExitTypes.Entrance, "wewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Looming Trees");
    exit = new Exit(ExitTypes.Entrance, "een");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Lost Woods");
    exit = new Exit(ExitTypes.Entrance, "wssssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Lost in the Forest");
    exit = new Exit(ExitTypes.Entrance, "ewsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Luminous Forest");
    exit = new Exit(ExitTypes.Entrance, "snssen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Marked Grave");
    exit = new Exit(ExitTypes.Entrance, "eewsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Massive Cold Campfire");
    exit = new Exit(ExitTypes.Entrance, "esnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Massive Hives");
    exit = new Exit(ExitTypes.Entrance, "wnnssssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Massive Nests");
    exit = new Exit(ExitTypes.Entrance, "ewnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Massive Paw Prints");
    exit = new Exit(ExitTypes.Entrance, "sen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nnwnw");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Massive Pines");
    exit = new Exit(ExitTypes.Entrance, "ewsnnnswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "snwesnsn");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "nnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Menacing Trees");
    exit = new Exit(ExitTypes.Entrance, "wewwen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "esnsn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Misplaced Boulder");
    exit = new Exit(ExitTypes.Entrance, "newwen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "snwwwnwnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Moldy Mushrooms");
    exit = new Exit(ExitTypes.Entrance, "sswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Monument Hill");
    exit = new Exit(ExitTypes.Entrance, "nsssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Motionless Trees");
    exit = new Exit(ExitTypes.Entrance, "nwnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Mounds of Sand");
    exit = new Exit(ExitTypes.Entrance, "ssesneewen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nw");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Muddy Forest Trail");
    exit = new Exit(ExitTypes.Entrance, "nwewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Muddy Riverway");
    exit = new Exit(ExitTypes.Entrance, "sesneewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Overgrown Forest Path");
    exit = new Exit(ExitTypes.Entrance, "nsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Overgrown Graveyard");
    exit = new Exit(ExitTypes.Entrance, "wen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Pale Mist");
    exit = new Exit(ExitTypes.Entrance, "nsnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Parched Forest");
    exit = new Exit(ExitTypes.Entrance, "swewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Patches of Mushrooms");
    exit = new Exit(ExitTypes.Entrance, "nnwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Piles of Acorns");
    exit = new Exit(ExitTypes.Entrance, "nsnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Placid Creek");
    exit = new Exit(ExitTypes.Entrance, "nwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Poisonous Thorns");
    exit = new Exit(ExitTypes.Entrance, "wnweewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Pools of Blood");
    exit = new Exit(ExitTypes.Entrance, "wsnssssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Puddles of Mud");
    exit = new Exit(ExitTypes.Entrance, "ewnnsnnnswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rabbit Holes");
    exit = new Exit(ExitTypes.Entrance, "nnnsnnnswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wnwsnwesnsn");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "wnwnnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Raging River");
    exit = new Exit(ExitTypes.Entrance, "wnsnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rainbow Woods");
    exit = new Exit(ExitTypes.Entrance, "ssnnnsnnnswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nwsnwesnsn");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "nwnnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rent Oaks");
    exit = new Exit(ExitTypes.Entrance, "nwneen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wnnn");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "n");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rocky Forest Pathway");
    exit = new Exit(ExitTypes.Entrance, "snwnnswewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rotting Carcass");
    exit = new Exit(ExitTypes.Entrance, "wnwewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rows of Stumps");
    exit = new Exit(ExitTypes.Entrance, "sseen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Rustling Leaves");
    exit = new Exit(ExitTypes.Entrance, "esesneewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sand Dunes");
    exit = new Exit(ExitTypes.Entrance, "ewsnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sandy Fields");
    exit = new Exit(ExitTypes.Entrance, "sesewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sandy Knoll");
    exit = new Exit(ExitTypes.Entrance, "nsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Scattered Bones");
    exit = new Exit(ExitTypes.Entrance, "nennnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Scene of Struggle");
    exit = new Exit(ExitTypes.Entrance, "swnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Shadowed Gully");
    exit = new Exit(ExitTypes.Entrance, "sewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Shallow Riverway");
    exit = new Exit(ExitTypes.Entrance, "sneesen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sharp Thorns");
    exit = new Exit(ExitTypes.Entrance, "nsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Shifting Sands");
    exit = new Exit(ExitTypes.Entrance, "wsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Shining Waters");
    exit = new Exit(ExitTypes.Entrance, "nsneewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Silent Path");
    exit = new Exit(ExitTypes.Entrance, "nnsnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Skeletal Trees");
    exit = new Exit(ExitTypes.Entrance, "snsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sleepy Forest");
    exit = new Exit(ExitTypes.Entrance, "wewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Smell of Rot");
    exit = new Exit(ExitTypes.Entrance, "wnssssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Soft Dirt");
    exit = new Exit(ExitTypes.Entrance, "sewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Sparkling River");
    exit = new Exit(ExitTypes.Entrance, "sewnsnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Splintered Trees");
    exit = new Exit(ExitTypes.Entrance, "neen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Steep Clifface");
    exit = new Exit(ExitTypes.Entrance, "nsnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Stench of Blood");
    exit = new Exit(ExitTypes.Entrance, "ssssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Streams of Wildflowers");
    exit = new Exit(ExitTypes.Entrance, "nsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Stuffy Woods");
    exit = new Exit(ExitTypes.Entrance, "ewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Swaying Treetops");
    exit = new Exit(ExitTypes.Entrance, "ssnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Swirling Breezes");
    exit = new Exit(ExitTypes.Entrance, "nennswewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Swirling Waters");
    exit = new Exit(ExitTypes.Entrance, "nweewen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Tangled Roots");
    exit = new Exit(ExitTypes.Entrance, "essnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Tangled Underbrush");
    exit = new Exit(ExitTypes.Entrance, "nsnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Taur-en-Faroth");
    exit = new Exit(ExitTypes.Entrance, "en");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "swwnnwnw");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "nwnwnnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Taur-im-Duinath");
    exit = new Exit(ExitTypes.Entrance, "ssswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thick Brushcover");
    exit = new Exit(ExitTypes.Entrance, "swsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thick Gnarled Trees");
    exit = new Exit(ExitTypes.Entrance, "swssssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thin Birches");
    exit = new Exit(ExitTypes.Entrance, "nnnsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thinning Forest");
    exit = new Exit(ExitTypes.Entrance, "ssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Thorned Vines");
    exit = new Exit(ExitTypes.Entrance, "seen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Towering Elms");
    exit = new Exit(ExitTypes.Entrance, "nswewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Tracks in the Sand");
    exit = new Exit(ExitTypes.Entrance, "nwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Trail of Blood");
    exit = new Exit(ExitTypes.Entrance, "wsnnnswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wwnwnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Trail of Drool");
    exit = new Exit(ExitTypes.Entrance, "sswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Twisted Branches");
    exit = new Exit(ExitTypes.Entrance, "neewsnnnswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "n");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Twisted Roots");
    exit = new Exit(ExitTypes.Entrance, "snsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Twisting Forest Trail");
    exit = new Exit(ExitTypes.Entrance, "esnsswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Undisturbed Forest");
    exit = new Exit(ExitTypes.Entrance, "eswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Uneven Forest Floor");
    exit = new Exit(ExitTypes.Entrance, "wwwsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Vacant Treetops");
    exit = new Exit(ExitTypes.Entrance, "ewsnnnswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Vanishing Forest Trail");
    exit = new Exit(ExitTypes.Entrance, "wsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wnnwnw");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Vine-covered River");
    exit = new Exit(ExitTypes.Entrance, "nseen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Wall of Rock");
    exit = new Exit(ExitTypes.Entrance, "wewnssen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nwnw");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Wall of Vines");
    exit = new Exit(ExitTypes.Entrance, "wwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Warm Breeze");
    exit = new Exit(ExitTypes.Entrance, "eewsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Webbed Trees");
    exit = new Exit(ExitTypes.Entrance, "nwnnswewwen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Weedy Path");
    exit = new Exit(ExitTypes.Entrance, "ensswsen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Wet Forest");
    exit = new Exit(ExitTypes.Entrance, "nnnenwsewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Whispering Trees");
    exit = new Exit(ExitTypes.Entrance, "sssnsswsen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "nwnnn");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Cave, "nn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Wild Brush");
    exit = new Exit(ExitTypes.Entrance, "nnswewwen");
    room.Exits.push(exit);
    exit = new Exit(ExitTypes.Mumak, "wsnwwwnwnnn");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Withered Branches");
    exit = new Exit(ExitTypes.Entrance, "esewnssen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    room = new Room("Withered Branchs");
    exit = new Exit(ExitTypes.Entrance, "neeen");
    room.Exits.push(exit);
    zone.Rooms.push(room);

    return zone;

}
//*********************************************************************************************************************
//End Create Faroth Exits
//*********************************************************************************************************************