function SkillCollection() {
    
    this.Skills = new Array();
    
    //Add a skill to the skills collection.
    this.Add = function(skillName, skillLevel){
        if (this.IndexOf(skillName) !== -1) return;
        var skill = new Skill(skillName, skillLevel);
        this.Skills.push(skill);
        jmc.ShowMe(skillName + " has been added to the skill collection.", "blue");
        return skill;
    }

    //Resets the skills collection.
    this.Clear = function() {
        this.Skills = new Array();
    };

    this.Count = function(){
        return this.Skills.length;
    }
    
    //Retrieve the skill from the skills collection by the specified skill name.
    this.GetSkill = function(skillName){
        for (var index = 0;index < this.Skills.length;index++){
            var currentSkill = this.Skills[index];        
            if (currentSkill.SkillName === skillName){
                return currentSkill;
            }
        }
        return null;
    }
    
    //Retrieve the ordinal index of a skill name in the skills collection.
    this.IndexOf = function(skillName){
        for (var index = 0;index < this.Skills.length;index++){
            var currentSkill = this.Skills[index];        
            if (currentSkill.SkillName === skillName){
                return index;
            }
        }
        return -1;
    }
    
    //List all skill names in a comma delimited format.
    this.ListSkills = function(){
        jmc.Parse("#wclear 0");
        jmc.Output("Registered skills: " + this.Skills.length, "green");
        for (var index = 0;index < this.Skills.length;index++){
            jmc.Output("Skill Name: " + this.Skills[index].SkillName + ", Skill Level: " + this.Skills[index].SkillLevel);
        }
        jmc.Output("");
    }
    
    //Remove a skill from the skill collection.
    this.Remove = function(skillName){
        var index = this.IndexOf(skillName);
        if (index !== -1){
            this.Skills.splice(index, 1);
            jmc.ShowMe(skillName + " has been removed from the skill collection.", "blue");
        }
    }

}