function Map(mapName, variableName) {
    this.Content = new Array();
    this.MapName = mapName;
    this.VariableName = variableName;
};

function MapCollection() {
    this.Maps = new Array();

    //Add a map to the maps collection.    
    this.Add = function(mapName, variableName) {
        if (mapName === "") throw "The map name cannot be blank.";
        if (variableName === "") throw "The variable name cannot be blank."
        if (this.IndexOf(mapName) !== -1) throw "Map name " + mapName + " already exists.";
        var map = new Map(mapName, variableName);
        this.Maps.push(map);
        return map;
    };

    //Resets the maps collection.
    this.Clear = function() {
        this.Maps = new Array();
    };

    this.Count = function() {
        return this.Maps.length;
    };

    //Retrieve the map from the maps collection by the specified map name.
    this.GetMap = function(mapName) {
        for (var index = 0; index < this.Maps.length; index++) {
            var currentMap = this.Maps[index];
            if (currentMap.MapName === mapName) {
                return currentMap;
            }
        }
        return null;
    };

    this.GetMapByIndex = function(index) {
        if (index <= -1) throw "Index must be greater than or equal to 0.";
        if (index >= this.Maps.length) throw "Index is outside the bounds of the map collection."
        return this.Maps[index];
    };

    //Retrieve the ordinal index of a map name in the maps collection.
    this.IndexOf = function(mapName) {
        for (var index = 0; index < this.Maps.length; index++) {
            var currentMap = this.Maps[index];
            if (currentMap.MapName === mapName) {
                return index;
            }
        }
        return -1;
    };

    //Remove a map from the map collection.
    this.Remove = function(mapName) {
        var index = this.IndexOf(mapName);
        if (index === -1) throw "Map name " + mapName + " does not exist in the map collection.";
        this.Maps.splice(index, 1);
    }
};