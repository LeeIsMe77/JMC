function Zone(zoneType) {
    this.ZoneType = zoneType;
    this.Rooms = new Array();

    this.GetRoom = function(roomName) {
        if (roomName === "") return null;
        for (var index = 0; index < this.Rooms.length; index++) {
            var room = this.Rooms[index];
            if (room.RoomName === roomName) {
                return room;
            }
        }
        return null;
    };

};