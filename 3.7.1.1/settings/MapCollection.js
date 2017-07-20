function MapCollection() {
    
    this.Maps = new Array();
    
    //Add a map to the maps collection.
    this.Add = function(mapName, variableName){
        if (mapName === ""){
            jmc.ShowMe("The map name cannot be blank.", "red");
            return;
        }
        if (variableName === ""){
            jmc.ShowMe("The variable name cannot be blank.", "red");
            return;
        }

        if (this.IndexOf(mapName) !== -1) {
            jmc.Parse("#wclear 0");
            jmc.ShowMe("Map name " + mapName + " already exists.", "red");
            return;
        }
        var map = new Map(mapName, variableName);
        this.Maps.push(map);
        return map;
    }

    //Resets the maps collection.
    this.Clear = function() {
        jmc.Parse("#wclear 0");
        this.Maps = new Array();
        jmc.ShowMe("Maps cleared successfully.", "green");
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
        jmc.Parse("#wclear 0");
        jmc.ShowMe("Map " + mapName + " does not exist.", "red");
        return null;
    }

    this.GetMapByIndex = function(index) {
        if (index == -1 || index >= this.Maps.length) {
            jmc.Parse("#wclear 0");
            jmc.ShowMe("Map index " + index + " does not exist.", "red");
            return null;
        }
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
    
    //List all map names in a comma delimited format.
    this.ListMaps = function(){
        jmc.Parse("#wclear 0");
        jmc.Output("Registered maps: " + this.Maps.length, "green");
        jmc.Output("");
        for (var index = 0;index < this.Maps.length;index++){
            jmc.Output(index + ") " + this.Maps[index].MapName);
        }
        jmc.Output("");
    }
    
    //Remove a map from the map collection.
    this.Remove = function(mapName){
        var index = this.IndexOf(mapName);
        if (index !== -1){
            jmc.ShowMe("Map " + mapName + " deleted successfully.", "green");
            this.Maps.splice(index, 1);
        }
    }
}