function ItemCollection() {
    this.Items = new Array();
}

ItemCollection.Add = function(item) {
    var databaseConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");

    try {

        var affections = "";
        for (var index = 0; index < item.Affections.length; index++) {
            var affection = String(item.Affections[index]);
            if (affection === null || affection === "") continue;
            if (affections === "") {
                affections = affection;
            } else {
                affections = affections + ", " + affection;
            }
        }

        var attributes = "";
        for (var index = 0; index < item.Attributes.length; index++) {
            var attribute = String(item.Attributes[index]);
            if (attribute === null || attribute === "") continue;
            if (attributes === "") {
                attributes = attribute;
            } else {
                attributes = attributes + ", " + attribute;
            }
        }


        databaseConnection.ConnectionString = DATABASE_CHARACTER_CONNECTION_STRING;
        databaseConnection.Open();

        command.ActiveConnection = databaseConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[ItemCollection.Add]";

        command.Parameters.Append(command.CreateParameter("@ItemName", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, String(item.ItemName)));
        command.Parameters.Append(command.CreateParameter("@ItemType", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, String(item.ItemType)));
        command.Parameters.Append(command.CreateParameter("@Usage", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, String(item.Usage)));
        command.Parameters.Append(command.CreateParameter("@Description", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 1024, String(item.Description)));
        command.Parameters.Append(command.CreateParameter("@Material", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, String(item.Material)));

        var parameter = command.CreateParameter("@DamageRating", ADODBParameterType.Decimal, ADODBParameterDirection.Input);
        parameter.Value = parseFloat(item.DamageRating);
        parameter.NumericScale = 2;
        parameter.Precision = 18
        command.Parameters.Append(parameter);

        parameter = command.CreateParameter("@Weight", ADODBParameterType.Decimal, ADODBParameterDirection.Input);
        parameter.Value = parseFloat(item.Weight);
        parameter.NumericScale = 2;
        parameter.Precision = 18
        command.Parameters.Append(parameter);

        command.Parameters.Append(command.CreateParameter("@Absorbtion", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.Absorbtion)));
        command.Parameters.Append(command.CreateParameter("@MinimumAbsorbtion", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.MinimumAbsorbtion)));
        command.Parameters.Append(command.CreateParameter("@Encumberance", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.Encumberance)));
        command.Parameters.Append(command.CreateParameter("@OffensiveBonus", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.OffensiveBonus)));
        command.Parameters.Append(command.CreateParameter("@Dodge", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.Dodge)));
        command.Parameters.Append(command.CreateParameter("@Parry", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.Parry)));
        command.Parameters.Append(command.CreateParameter("@Bulk", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.Bulk)));
        command.Parameters.Append(command.CreateParameter("@ToHit", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.ToHit)));
        command.Parameters.Append(command.CreateParameter("@ToDamage", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.ToDamage)));
        command.Parameters.Append(command.CreateParameter("@BreakPercentage", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.BreakPercentage)));
        command.Parameters.Append(command.CreateParameter("@Capacity", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(item.Capacity)));
        command.Parameters.Append(command.CreateParameter("@Attributes", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 1024, attributes));
        command.Parameters.Append(command.CreateParameter("@Affections", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 1024, String(affections)));
        command.Parameters.Append(command.CreateParameter("@ItemID", ADODBParameterType.Int, ADODBParameterDirection.Output));
        command.Execute();

    } catch (caught) {
        throw new JMCException("Failure Adding Item: " + caught.message);
    } finally {
        // clean up  
        if (databaseConnection.State === 1) {
            databaseConnection.Close();
            databaseConnection = null;
        }
    };

};

ItemCollection.Enumerate = function() {
    var itemCollection = new ItemCollection();

    var databaseConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");
    var recordSet = new ActiveXObject("ADODB.Recordset");

    try {

        databaseConnection.ConnectionString = DATABASE_CHARACTER_CONNECTION_STRING;
        databaseConnection.Open();

        command.ActiveConnection = databaseConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[ItemCollection.Enumerate]";
        recordSet = command.Execute();

        while (!recordSet.EOF) {
            var newItem = new Item(String(recordSet("ItemName")));
            newItem.ItemID = parseInt(recordSet("ItemID"));
            //TODO: Finish item enumeration code.
            itemCollection.Items.push(newItem);
            recordSet.MoveNext();
        }

    } catch (caught) {
        throw new JMCException("Failure Enumerating Items: " + caught.message);
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
    return itemCollection;
};