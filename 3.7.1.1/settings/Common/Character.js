function Character(characterName, alignment, gender, race) {

    this.LogonTime = new Date();

    this.CharacterID = -1;

    this.CharacterName = characterName;
    this.Alignment = alignment;
    this.Gender = gender;
    this.Race = race;

    this.Level = 0;

    this.WarriorLevel = 0;
    this.RangerLevel = 0;
    this.MysticLevel = 0;
    this.MageLevel = 0;

    this.Specialization = "None";

    this.XPNeeded = 0;
    this.XPGained = 0;

    this.Height = 0;
    this.Weight = 0;
    this.CarriedWeight = 0;

    this.CurrentHitPoints = 0;
    this.CurrentStamina = 0;
    this.CurrentMoves = 0;

    this.MaxHitPoints = 0;
    this.MaxStamina = 0;
    this.MaxMoves = 0;

    this.Spirit = 0;

    this.CurrentStrength = 0;
    this.CurrentIntelligence = 0;
    this.CurrentWill = 0;
    this.CurrentDexterity = 0;
    this.CurrentConstitution = 0;
    this.CurrentLearningAbility = 0;

    this.MaxStrength = 0;
    this.MaxIntelligence = 0;
    this.MaxWill = 0;
    this.MaxDexterity = 0;
    this.MaxConstitution = 0;
    this.MaxLearningAbility = 0;

    this.OffensiveBonus = 0;
    this.DodgeBonus = 0;
    this.ParryBonus = 0;
    this.AttackSpeed = 0;

    this.DefenseSum = function() {
        return parseInt(this.ParryBonus) + parseInt(this.DodgeBonus);
    }

    this.StatSum = function() {
        return parseInt(this.MaxStrength) + parseInt(this.MaxIntelligence) + parseInt(this.MaxWill) +
            parseInt(this.MaxDexterity) + parseInt(this.MaxConstitution) + parseInt(this.MaxLearningAbility);
    }

    this.Update = function() {

        var command = new ActiveXObject("ADODB.Command");
        var recordSet = new ActiveXObject("ADODB.Recordset");
        try {
            command.ActiveConnection = connection;
            command.CommandType = 4;
            command.CommandText = "dbo.[GetRoom]";

            command.Parameters.Append(command.CreateParameter("@CharacterID", 3, 1, null, this.CharacterID));
            command.Parameters.Append(command.CreateParameter("@CharacterName", 200, 1, 20, this.CharacterName));
            command.Parameters.Append(command.CreateParameter("@Level", 3, 1, null, this.Level));

            jmc.ShowMe("Executing");
            recordSet = command.Execute();

            jmc.ShowMe(AnsiColors.ForegroundBrightBlue + GetTimestamp() + ": Data set retrieved... Showing...");

            var message = "Room Name: " + recordSet.Fields("RoomName");
            message = message + ", Front Entrance: " + recordSet.Fields("Exit1");
            message = message + ", Back Entrance: " + recordSet.Fields("Exit2");
            message = message + ", Swamp: " + recordSet.Fields("Exit3");

            jmc.ShowMe(AnsiColors.ForegroundRed + GetTimestamp() + ": " + message);

        } catch (caught) {
            var message = "Failure Retrieving Exit: " + caught.message;
            JMCException.LogException(message);
            WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
        } finally {
            // clean up  
            if (recordSet.State === 1) {
                recordSet.Close();
            }
            // if (connection.State === 1) {
            //     connection.Close();
            // }
            // connection = null;
            recordSet = null;
        }
    }

};

Character.RetrieveCharacter = function(characterName) {

};