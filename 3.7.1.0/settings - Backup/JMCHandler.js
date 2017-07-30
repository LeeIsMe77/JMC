function JMCHandler(){
    this.OnConnected = function() { }
    this.OnIncoming = function() { 
        var incomingLine = jmc.Event;
        var abortExpression = new RegExp("(.)+>");

        //Perform a regex test on the incoming line to verify it is a score line...
        var matches = incomingLine.match(new RegExp("You have ([0-9]+)/([0-9]+) hit, ([0-9]+)/([0-9]+) stamina, ([0-9]+)/([0-9]+) moves, ([0-9]+) spirit."));
        if (matches !== null && matches.length > 0){
            //..and if it is, process the score line.
            SetCharacterStatus(matches[0]);
        }

        if (_isMapping){
            matches = incomingLine.match(new RegExp("[( .+-|V)]+"));
            if (matches !== null && matches.length > 0){
                jmc.Parse("#woutput {0}{" + matches[0] + "}");
                jmc.DropEvent();
                return;
            }    
            if (incomingLine == "" || abortExpression.test(incomingLine)){
                _isMapping = false;
            }
        }

        if (_isListeningForStatus){
            if (incomingLine == "" || abortExpression.test(incomingLine)){
                _isListeningForStatus = false;
            }
            jmc.DropEvent();
        }

        if (_isListeningForGroup){
            ParseForGroupLine(incomingLine);
            // if (incomingLine == "" || abortExpression.test(incomingLine)){
            //     _isListeningForGroup = false;
            // }
            // else{
            //     matches =incomingLine.match(new RegExp("HP:(.)+S:(.)+ MV:(.)+ -- (.)+"));
            //     if (matches !== null && matches.length > 0){
            //         var memberNameArray = matches[0].split("-- ");
            //         if (memberNameArray !== null && memberNameArray.length == 2){
            //             var memberName = memberNameArray[1];                    
            //             var cleanName = CleanName(memberName);
            //             if (cleanName !== "") {
            //                 if (_group.IndexOf(cleanName) === -1){
            //                     _group.Add(cleanName, memberName.indexOf(" (Head of group)") !== -1);
            //                 }
            //             }
            //         }
            //     }
            //     jmc.DropEvent();
            //     return;            
            // }
        }

        if (_group.Count() > 0){
            ParseForMutilate(incomingLine);
        }
    }
    this.OnInput = function() { }
    this.OnTimer = function() {
        switch (parseInt(jmc.Event)){
            case TIMER_STATUS:
                OnStatusTimer();
                break;
            case TIMER_AFK:
                OnAfkTimer();
                break;
            case TIMER_ARKEN_MOVE:
                OnArkenMoveTimer();
                break;
            case TIMER_ARKEN_WAIT:
                OnArkenWaitTimer();
                break;
            default:
                return;
        }
    }
    ParseForGroupLine = function(incomingLine){
        if (incomingLine == "" || new RegExp("(.)+>").test(incomingLine)){
            _isListeningForGroup = false;
        }
        else{
            var matches =incomingLine.match(new RegExp("HP:(.)+S:(.)+ MV:(.)+ -- (.)+"));
            if (matches !== null && matches.length > 0){
                var memberNameArray = matches[0].split("-- ");
                if (memberNameArray !== null && memberNameArray.length == 2){
                    var memberName = memberNameArray[1];                    
                    var cleanName = CleanName(memberName);
                    if (cleanName !== "") {
                        if (_group.IndexOf(cleanName) === -1){
                            _group.Add(cleanName, memberName.indexOf(" (Head of group)") !== -1);
                        }
                    }
                }
            }        
            jmc.DropEvent();
        }
    }
    ParseForMutilate = function(incomingLine){
        var memberName = "";    
        var memberMutRegEx = incomingLine.match(new RegExp("([a-zA-Z]+) (MUTILATE)(.)+ with (his|her|its) deadly (.)+!!"));
        if (memberMutRegEx !== null && memberMutRegEx.length > 1){
            memberName = memberMutRegEx[1];            
        }
        else {        
            var meMutRegEx = incomingLine.match(new RegExp("(.)*You MUTILATE (.)+ with your deadly (.)+!!"));
            if (meMutRegEx !== null && meMutRegEx.length > 0){            
                memberName = jmc.GetVar("me");
                jmc.ShowMe("Value of me: " + memberName);
            }
        }
        if (memberName == "" || _group.IndexOf(memberName) == -1){
            return;
        }
        
        jmc.ShowMe("Mutilate registered by: " + memberName);
        _group.IncrementMutilateCount(memberName);
    }
}