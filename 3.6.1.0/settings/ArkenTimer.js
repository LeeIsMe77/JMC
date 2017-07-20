//Once this function is fired, send a command to the client indicating it is time to move.
function OnArkenMoveTimer(){
    jmc.Parse("lookRoom");
}

//Once this function is hit, turn itself off and re-engage the movement timer.
function OnArkenWaitTimer(){
    ToggleArkenWaitTimer(false);
    ToggleArkenMoveTimer(true);
}

//Toggles the Arken spirit triggers movement timer.
function ToggleArkenMoveTimer(isEnabled){
    if (isEnabled){
        jmc.SetTimer(TIMER_ARKEN_MOVE, 50);
    }
    else{    
        jmc.KillTimer(TIMER_ARKEN_MOVE);
    } 
}

//Toggles the Arken spirit triggers wait timer.
function ToggleArkenWaitTimer(isEnabled){
    if (isEnabled){
        jmc.SetTimer(TIMER_ARKEN_WAIT, 1500);
    }
    else{    
        jmc.KillTimer(TIMER_ARKEN_WAIT);
    }  
}
