function ToggleRescue(){
    var isRescueOn = jmc.GetVar("rescueOn") !== "True";
    var color = "red";
    jmc.Parse("#unaction {%0 turns to fight %1!}{#script OnRescue(%0)}");
    if (isRescueOn){
        color = "green";
        jmc.Parse("#action {%0 turns to fight %1!}{#script OnRescue(%0)}");
    }    
    jmc.SetVar("rescueOn", isRescueOn);
    jmc.ShowMe("Rescue trigger is " + isRescueOn, color);
}

function OnRescue(target){
    if (!isRescueOn) return;
    switch (target.toLowerCase()){
        case 'fali':
            jmc.ShowMe(target + " is not a rescuable target.", "red");
            break;
        default:
            jmc.Send("rescue " + target);
            break;
    }
}
