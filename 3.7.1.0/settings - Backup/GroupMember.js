function GroupMember(memberName, isLeader){
    this.MemberName = memberName;
    this.IsLeader = isLeader;
    this.MutilateCount = 0;
    this.FriendlyName = function(){
        if (this.IsLeader){
            return this.MemberName + " (Leader)";
        }
        return this.MemberName;
    }
    this.IncrementMutilateCount = function(){
        this.MutilateCount++;
    }
    this.ClearMutilates = function(){
        this.MutilateCount = 0;
    }
}