function Map(mapName, variableName){    
    this.Content = new Array();
    this.MapName = mapName;
    this.VariableName = variableName;
    this.DisplayMap = function(){        
        if (this.Content.length === 0) return;
        jmc.Parse("#wclear 0");
        jmc.Output(mapName, "red");
        jmc.Output("");
        for (var index = 0;index < this.Content.length;index++){
            jmc.OutPut(this.Content[index]);
        }        
    }
}