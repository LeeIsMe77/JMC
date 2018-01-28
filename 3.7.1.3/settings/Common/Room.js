function Room(roomName) {
    this.RoomName = roomName;
    this.Exits = new Array();
    this.GetExit = function(exitType) {
        for (var index = 0; index < this.Exits.length; index++) {
            var exit = this.Exits[index];
            if (exit.ExitType === exitType) {
                return exit;
            }
        }
        return null;
    };

    this.GetExitString = function() {
        var exits = []
        for (var index = 0; index < this.Exits.length; index++) {
            var exit = this.Exits[index];
            exits.push(exit.ExitType + ":" + exit.ExitDirections);
        }
        return exits.join(" | ");
    };

};