function AutoAfk(){
    var isAutoAfk = jmc.GetVar("autoAfk") !== "True";
    if (isAutoAfk){
        jmc.SetTimer(TIMER_AFK, 150);
        jmc.ShowMe("Auto AFK is on", "green");
    }
    else{    
        jmc.KillTimer(1);
        jmc.ShowMe("Auto AFK is off", "red");
    }  
    jmc.SetVar("autoAfk", isAutoAfk);
}

function OnAfk(){
    jmc.Send("afk");
}