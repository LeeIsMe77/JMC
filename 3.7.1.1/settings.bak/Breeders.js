function TriggerMob(mobName, mobAlias, mobDescription, isAggressive){
    this.MobName = mobName;
    this.MobAlias = mobAlias;
    this.MobDescription = mobDescription;
    this.IsAggressive = isAggressive;
}

function TriggerRoom(roomID, roomName, triggerPattern, triggerAction, nextDirection, isSafe, executeWait){
    this.RoomID = roomID;
    this.Mobs = new Array();
    this.IsSafe = isSafe;
    this.NextDirection = nextDirection;
    this.RoomName = roomName;
    this.TriggerAction = triggerAction;
    this.TriggerPattern = triggerPattern;
    this.ExecuteWait = executeWait;
}

function TriggerRoom(roomID, roomName, triggerPattern, triggerAction, nextDirection, isSafe, executeWait, mobs){
    var triggerRoom = new TriggerRoom(roomID, roomName, triggerPattern, triggerAction, nextDirection, isSafe, executeWait);
    triggerRoom.Mobs = mobs;
    return triggerRoom;
}

var _previousRoomID = -1;
var _currentRoom = null;

function TriggerZone(zoneName){
    this.Rooms = new Array();
    this.ZoneName = zoneName;    
    this.GetRooms = function(roomName){
        var knownRooms = new Array();
        for (var index = 0;index <= this.Rooms.length;index++){
            var room = this.Rooms[index];
            if (room.RoomName === roomName){
                knownRooms.push(room);
            }
        }
        return knownRooms;
    }
}

function TriggerZone(zoneName, triggerRooms){
    var triggerZone = new TriggerZone(zoneName);
    triggerZone.Rooms = triggerRooms;
    return triggerZone;
}

var _triggerZone = this.CreateBreedersTriggerZone();

function CreateBreedersTriggerZone(){

    var ferociousWarg = new TriggerMob(
        "A ferocious warg",
        "ferocious",
        "A ferocious warg stands here, snarling maliciously.",
        true
    );

    var trainedWarg = new TriggerMob(
        "A trained warg",
        "trained",
        "A trained warg waits here for an order from its masters.",
        true
    )

    var masterBreeder = new TriggerMob(
        "The master breeder",
        "master",
        "The master breeder stands here with whip in hand.",
        true
    )

    var zone = this.TriggerZone(
        "Breeders",
        [
            //Walk Way rooms listed west to east....
            this.TriggerRoom(//WW of Top Middle
                1,
                "Walk Way",
                "   A wooden walkway crosses over a deep pit here.  The boards continue to the",
                function() { return "d"; },
                false,
                false,
                [
                    ferociousWarg
                ]
            ),
            this.TriggerRoom(//W of Top Middle
                2,
                "Walk Way", 
                "   The walk way continues to sway and bend under any weight impairing rapid",
                function() { return "w"; },
                true,
                true,
                []
            ),
            this.TriggerRoom(//Top Middle Room
                3,
                "Walk Way",
                "   The walk way appears to sway and move with any amount of wind or weight is",
                function() { return "w"; },
                false,
                false,
                [
                    trainedWarg
                ]
            ),
            this.TriggerRoom(//E of Top Middle
                4,
                "Walk Way", 
                "   To the immediate south is a barn with stalls to examine the various canines",
                function() { return "w"; },
                true,
                true,
                []
            ),
            this.TriggerRoom(//EE of Top Middle
                5,
                "Walk Way", 
                "   The walk way overlooks the pits in all directions. From here one could lift",
                function() { return "w"; },
                false,
                false,
                [
                    ferociousWarg
                ]
            ),

            this.TriggerRoom(//WW of Master.
                6,
                "Pit",
                "   The pit appears to be empty of any animals except a pile of straw. Slowly",
                function() { return "w"; },
                false,
                [
                    ferociousWarg
                ]
            ),
            this.TriggerRoom(//W of Master
                7,
                "Pit",
                "   All directions and exits here are no longer blocked by the wooden gates",
                function() { return "w"; },
                true,
                []
            ),
            this.TriggerRoom(//WN of Master
                8,
                "Pit",
                "   The room is very wet and small puddles of water are in the middle of the",
                function() { return "w"; },
                false,
                [
                    trainedWarg
                ]
            ),
            this.TriggerRoom(//WS of Master
                9,
                "Pit",
                "   The room has been dug out of the ground to house some type of large animal",
                function() { return "w"; },
                false,
                [
                    trainedWarg
                ]
            ),

            this.TriggerRoom(//Master Breeder
                10,
                "A Blood-Stained Pit",
                "   This room appears to be the central area of the pit, with a shallow pool of",
                function() { return "w"; },
                false,
                [
                    masterBreeder
                ]
            ),
            this.TriggerRoom(//E of Master. Safe
                11,
                "Pit",
                "   The walls of the pits are made of stone and clay. Water slowly trickles",
                function() { return "w"; },
                true,
                []
            ),

            this.TriggerRoom(//EN of Master. Not safe.
                12,
                "Pit",
                "   Dark and damp, this room is used to contain a creature of some sort. Marks",
                function() { return "w"; },
                false,
                [
                    trainedWarg
                ]
            ),

            this.TriggerRoom(//ES of Master. Not Safe
                13,
                "Pit",
                "   The stone walls and wooden gate to the north block the chance of escape for",
                function() { return "w"; },
                true,
                [
                    trainedWarg
                ]
            ),

            this.TriggerRoom(//EE of Master. Not safe.
                14,
                "Pit",
                "   This area of the pit seems to be used as the cage for the most viscous",
                function() { return "w"; },
                false,
                [
                    ferociousWarg
                ]
            ),
            this.TriggerRoom(//S of Master Breeder
                15,
                "Beginning of a Pit",
                "   The ground slopes upward to the south and continues to go down to the",
                function() { return "w"; },
                true,
                []
            ),
        ]
    );

    return zone;
}

function TriggerZoneCollection(){
    this.Zones = new Array();
}

var _breedersTriggersOn = false;
function ParseForBreedersLine(incomingLine){

}