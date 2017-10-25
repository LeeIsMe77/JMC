function Skill(skillName, skillLevel, time, cost) {
    this.SkillName = skillName;
    this.SkillLevel = skillLevel;
    this.Time = time;
    this.Cost = cost;
};

function SkillCollection() {

    this.SessionsRemaining = 0;
    this.Skills = new Array();

    //Add a skill to the skills collection.
    this.Add = function(skillName, skillLevel, time, cost) {
        if (this.IndexOf(skillName) !== -1) return;
        var skill = new Skill(skillName, skillLevel, time, cost);
        this.Skills.push(skill);
        return skill;
    };

    //Resets the skills collection.
    this.Clear = function() {
        this.Skills = new Array();
    };

    this.Count = function() {
        return this.Skills.length;
    };

    //Retrieve the skill from the skills collection by the specified skill name.
    this.GetSkill = function(skillName) {
        for (var index = 0; index < this.Skills.length; index++) {
            var currentSkill = this.Skills[index];
            if (currentSkill.SkillName === skillName) {
                return currentSkill;
            }
        }
        return null;
    };

    //Retrieve the ordinal index of a skill name in the skills collection.
    this.IndexOf = function(skillName) {
        for (var index = 0; index < this.Skills.length; index++) {
            var currentSkill = this.Skills[index];
            if (currentSkill.SkillName === skillName) {
                return index;
            }
        }
        return -1;
    };

    //Remove a skill from the skill collection.
    this.Remove = function(skillName) {
        var index = this.IndexOf(skillName);
        if (index !== -1) {
            this.Skills.splice(index, 1);
        }
    }
};