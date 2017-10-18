function CharacterCollection() {

    this.Characters = new Array();

    //Retrieve a character from the collection by name.
    this.GetCharacter = function(characterName) {
        for (var index = 0; index < this.Characters.length; index++) {
            var currentCharacter = this.Characters[index];
            jmc.ShowMe("Current character name: " + currentCharacter.CharacterName);
            if (currentCharacter.CharacterName === characterName) {
                return currentCharacter;
            }
        }
        return null;
    }

}

CharacterCollection.Add = function(characterName) {
    var databaseConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");
    try {

        databaseConnection.ConnectionString = "Provider=MSDASQL.1;Password=P@ssw0rd;Persist Security Info=True;User ID=JMCMudClient;Data Source=RotS;Initial Catalog=RotS";
        databaseConnection.Open();

        command.ActiveConnection = databaseConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[CharacterCollection.Add]";
        command.Parameters.Append(command.CreateParameter("@CharacterName", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, characterName));
        command.Parameters.Append(command.CreateParameter("@CharacterID", ADODBParameterType.Int, ADODBParameterDirection.Output));

        command.Execute();

        return new Character(parseInt(command.Parameters("@CharacterID").Value), characterName);

    } catch (caught) {
        throw new JMCException("Failure Adding Character: " + caught.message);
    } finally {
        // clean up  
        if (databaseConnection.State === 1) {
            databaseConnection.Close();
            databaseConnection = null;
        }
    }

};

CharacterCollection.Enumerate = function() {
    var characterCollection = new CharacterCollection();

    var databaseConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");
    var recordSet = new ActiveXObject("ADODB.Recordset");

    try {

        databaseConnection.ConnectionString = "Provider=MSDASQL.1;Password=P@ssw0rd;Persist Security Info=True;User ID=JMCMudClient;Data Source=RotS;Initial Catalog=RotS";
        databaseConnection.Open();

        command.ActiveConnection = databaseConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[CharacterCollection.Enumerate]";
        recordSet = command.Execute();

        command.Parameters.Append(command.CreateParameter("@Race", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Parameters.Append(command.CreateParameter("@XPNeededToLevel", ADODBParameterType.Int, ADODBParameterDirection.Output));

        while (!recordSet.EOF) {
            var newCharacter = new Character(parseInt(recordSet("CharacterID")), String(recordSet("CharacterName")));
            newCharacter.Race = String(recordSet("Race"));
            newCharacter.Level = parseInt(recordSet("Level"));
            newCharacter.XPNeededToLevel = parseInt(recordSet("XPNeededToLevel"));
            newCharacter.LastLogon = Date.parse(recordSet("LastLogon"))
            characterCollection.Characters.push(newCharacter);
            recordSet.MoveNext();
        }

    } catch (caught) {
        throw new JMCException("Failure Enumerating Characters: " + caught.message);
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
    return characterCollection;
};