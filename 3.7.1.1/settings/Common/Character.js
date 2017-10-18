function Character(characterID, characterName) {
    this.LogonTime = new Date();
    this.LastLogon = null;
    this.CharacterID = characterID;
    this.CharacterName = characterName;
    this.Password = null;
    this.Alignment = 0;
    this.Gender = "Unknown";
    this.Race = "Unknown";
    this.Level = 0;
    this.WarriorLevel = 0;
    this.RangerLevel = 0;
    this.MysticLevel = 0;
    this.MageLevel = 0;
    this.Specialization = "None";
    this.XPNeededToLevel = 0;
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
    };
    this.StatSum = function() {
        return parseInt(this.MaxStrength) + parseInt(this.MaxIntelligence) + parseInt(this.MaxWill) +
            parseInt(this.MaxDexterity) + parseInt(this.MaxConstitution) + parseInt(this.MaxLearningAbility);
    };
    this.Update = function() {
        var databaseConnection = new ActiveXObject("ADODB.Connection");
        var command = new ActiveXObject("ADODB.Command");
        var recordSet = new ActiveXObject("ADODB.Recordset");
        try {

            databaseConnection.ConnectionString = "Provider=MSDASQL.1;Password=P@ssw0rd;Persist Security Info=True;User ID=JMCMudClient;Data Source=RotS;Initial Catalog=RotS";
            databaseConnection.Open();

            command.ActiveConnection = databaseConnection;
            command.CommandType = 4;
            command.CommandText = "dbo.[Character.Update]";

            command.Parameters.Append(command.CreateParameter("@CharacterID", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.CharacterID));
            command.Parameters.Append(command.CreateParameter("@CharacterName", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, this.CharacterName));
            command.Parameters.Append(command.CreateParameter("@Password", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 1000, this.Password));
            command.Parameters.Append(command.CreateParameter("@Race", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 50, this.Race));
            command.Parameters.Append(command.CreateParameter("@Level", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.Level));
            command.Parameters.Append(command.CreateParameter("@WarriorLevel", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.WarriorLevel));
            command.Parameters.Append(command.CreateParameter("@RangerLevel", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.RangerLevel));
            command.Parameters.Append(command.CreateParameter("@MysticLevel", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.MysticLevel));
            command.Parameters.Append(command.CreateParameter("@MageLevel", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.MageLevel));
            command.Parameters.Append(command.CreateParameter("@Strength", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.MaxStrength));
            command.Parameters.Append(command.CreateParameter("@Intelligence", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.MaxIntelligence));
            command.Parameters.Append(command.CreateParameter("@Will", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.MaxWill));
            command.Parameters.Append(command.CreateParameter("@Dexterity", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.MaxDexterity));
            command.Parameters.Append(command.CreateParameter("@Constitution", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.MaxConstitution));
            command.Parameters.Append(command.CreateParameter("@LearningAbility", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.MaxLearningAbility));
            command.Parameters.Append(command.CreateParameter("@Specialization", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, this.Specialization));
            command.Parameters.Append(command.CreateParameter("@XPNeededToLevel", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.XPNeededToLevel));

            command.Execute();

        } catch (caught) {
            throw new JMCException("Failure Updating Character: " + caught.message);
        } finally {
            // clean up  
            if (recordSet.State === 1) {
                recordSet.Close();
                recordSet = null;
            }
            if (databaseConnection.State === 1) {
                databaseConnection.Close();
                databaseConnection = null;
            }
        }
    };
};

Character.Initialize = function(characterID) {
    var databaseConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");
    var recordSet = new ActiveXObject("ADODB.Recordset");
    try {

        databaseConnection.ConnectionString = "Provider=MSDASQL.1;Password=P@ssw0rd;Persist Security Info=True;User ID=JMCMudClient;Data Source=RotS;Initial Catalog=RotS";
        databaseConnection.Open();

        command.ActiveConnection = databaseConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[Character.Initialize]";

        jmc.ShowMe("Pre execute");

        var parameter = command.CreateParameter("@CharacterID", ADODBParameterType.Int, ADODBParameterDirection.Input);
        parameter.Value = parseInt(characterID);
        command.Parameters.Append(parameter);
        command.Parameters.Append(command.CreateParameter("@CharacterName", ADODBParameterType.VarChar, ADODBParameterDirection.Output, 128));
        command.Parameters.Append(command.CreateParameter("@Password", ADODBParameterType.VarChar, ADODBParameterDirection.Output, 1000));
        command.Parameters.Append(command.CreateParameter("@Race", ADODBParameterType.VarChar, ADODBParameterDirection.Output, 50));
        command.Parameters.Append(command.CreateParameter("@Level", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@WarriorLevel", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@RangerLevel", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@MysticLevel", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@MageLevel", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@Strength", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@Intelligence", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@Will", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@Dexterity", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@Constitution", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@LearningAbility", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@Specialization", ADODBParameterType.VarChar, ADODBParameterDirection.Output, 128));
        command.Parameters.Append(command.CreateParameter("@XPNeededToLevel", ADODBParameterType.Int, ADODBParameterDirection.Output));

        command.Execute();

        jmc.ShowMe("Command executed.");

        var character = new Character(characterID, command.Parameters("@CharacterName").Value);
        character.Password = command.Parameters("@Password").Value;
        character.Race = command.Parameters("@Race").Value;
        character.Level = parseInt(command.Parameters("@Level").Value);
        character.WarriorLevel = parseInt(command.Parameters("@WarriorLevel").Value);
        character.RangerLevel = parseInt(command.Parameters("@RangerLevel").Value);
        character.MysticLevel = parseInt(command.Parameters("@MysticLevel").Value);
        character.MaxStrength = parseInt(command.Parameters("@Strength").Value);
        character.MaxIntelligence = parseInt(command.Parameters("@Intelligence").Value);
        character.MaxWill = parseInt(command.Parameters("@Will").Value);
        character.MaxDexterity = parseInt(command.Parameters("@Dexterity").Value);
        character.MaxConstitution = parseInt(command.Parameters("@Constitution").Value);
        character.MaxLearningAbility = parseInt(command.Parameters("@LearningAbility").Value);
        character.Specialization = command.Parameters("@Specialization").Value;
        return character;

    } catch (caught) {

        jmc.ShowMe(caught.message);
        throw new JMCException("Failure Initializing Character: " + caught.message);
    } finally {
        // clean up   
        if (recordSet.State === 1) {
            recordSet.Close();
            recordSet = null;
        }
        if (databaseConnection.State === 1) {
            databaseConnection.Close();
            databaseConnection = null;
        }
    }
};