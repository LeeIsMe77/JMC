function MapCollection() {

	this.Maps = new Array();

	//Add a map to the maps collection.
	this.Add = function (mapName, variableName) {
		if (this.IndexOf(mapName) !== -1) return;
		var map = new Map(mapName, variableName);
		this.Maps.push(map);
		return map;
	}

	//Resets the maps collection.
	this.Clear = function () {
		this.Maps = new Array();
	};

	this.Count = function () {
		return this.Maps.length;
	}

	//Retrieve the map from the maps collection by the specified map name.
	this.GetMap = function (mapName) {
		for (var index = 0; index < this.Maps.length; index++) {
			var currentMap = this.Maps[index];
			if (currentMap.MapName === mapName) {
				return currentMap;
			}
		}
		return null;
	}

	//Retrieve the ordinal index of a map name in the maps collection.
	this.IndexOf = function (mapName) {
		for (var index = 0; index < this.Maps.length; index++) {
			var currentMap = this.Maps[index];
			if (currentMap.MapName === mapName) {
				return index;
			}
		}
		return -1;
	}

	//List all map names in a comma delimited format.
	this.ListMaps = function () {
		jmc.Parse("#wclear 0");
		jmc.Output("Registered maps: " + this.Maps.length, "green");
		for (var index = 0; index < this.Maps.length; index++) {
			jmc.Output(this.Maps[index].MapName);
		}
		jmc.Output("");
	}

	//Remove a map from the map collection.
	this.Remove = function (mapName) {
		var index = this.IndexOf(mapName);
		if (index !== -1) {
			this.Maps.splice(index, 1);
		}
	}

}