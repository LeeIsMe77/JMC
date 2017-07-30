
function GroupMemberCollection(){
    
    this.GroupMembers = new Array();

    //Add a member to the group members collection.
    this.Add = function(memberName, isLeader){
        var groupMember = new GroupMember(memberName, isLeader);
        this.GroupMembers.push(groupMember);
        jmc.ShowMe(groupMember.FriendlyName() + " has been added to the group.", "blue");
        return groupMember;
    }

    //Resets the group members collection.
    this.Clear = function() {
        this.GroupMembers = [];
    };

    this.Count = function(){
        return this.GroupMembers.length;
    }
    
    //Retrieve the member from the group members collection by the specified group member name.
    this.GetMember = function(memberName){
        for (var index = 0;index < this.GroupMembers.length;index++){
            var currentMember = this.GroupMembers[index];        
            if (currentMember.Name === memberName){
                return currentMember;
            }
        }
        return null;
    }
    
    //Retrieve the ordinal index of a member name in the group members collection.
    this.IndexOf = function(memberName){
        for (var index = 0;index < this.GroupMembers.length;index++){
            var currentMember = this.GroupMembers[index];        
            if (currentMember.MemberName === memberName){
                return index;
            }
        }
        return -1;
    }
    
    //List all group member names in a comma delimited format.
    this.ListMembers = function(){
        var stringArray = new Array();
        for (var index = 0; index < this.Count(); index++){
            var currentMember = this.GroupMembers[index];
            stringArray.push(currentMember.FriendlyName());
        }
        return stringArray.join(", ");
    }
    
    //Remove a member from the group member collection.
    this.Remove = function(memberName){
        var index = this.IndexOf(memberName);
        if (index !== -1){
            var groupMemberName = this.GroupMembers[index].FriendlyName();        
            this.GroupMembers.splice(index, 1);
            jmc.ShowMe(groupMemberName + " has been added to the group.", "blue");
        }
    }

    this.ListMutilates = function(){
        jmc.Send("gt Mutilate Statistics:")
        for (var index = 0;index < this.GroupMembers.length;index++){
            var currentMember = this.GroupMembers[index];        
            jmc.Send("gt " + currentMember.MemberName + ": " + currentMember.MutilateCount);
        }
    }

    this.IncrementMutilateCount = function(memberName){
        var index = this.IndexOf(memberName);
        if (index === -1) return;
        this.GroupMembers[index].IncrementMutilateCount();
    }
}