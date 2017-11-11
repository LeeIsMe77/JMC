function Item(ItemName) {

    this.ItemName = ItemName;
    this.ItemType = "";
    this.ItemID = -1;
    this.Description = "";
    this.Material = "";
    this.Usage = "";
    this.Bulk = 0;
    this.Weight = 0;
    this.Absorbtion = 0;
    this.MinimumAbsorbtion = 0;
    this.Encumberance = 0;
    this.OffensiveBonus = 0;
    this.Dodge = 0;
    this.Parry = 0;
    this.DamageRating = 0;
    this.ToHit = 0;
    this.ToDamage = 0;
    this.BreakPercentage = 0;
    this.Capacity = 0;
    this.Attributes = new Array();
    this.Affections = new Array();

    this.Update = function() {
        var databaseConnection = new ActiveXObject("ADODB.Connection");
        var command = new ActiveXObject("ADODB.Command");
        var recordSet = new ActiveXObject("ADODB.Recordset");
        try {

            var affections = "";
            for (var index = 0; index < this.Affections.length; index++) {
                var affection = String(this.Affections[index]);
                if (affection === null || affection === "") continue;
                if (affections === "") {
                    affections = affection;
                } else {
                    affections = affections + ", " + affection;
                }
            }

            var attributes = "";
            for (var index = 0; index < this.Attributes.length; index++) {
                var attribute = String(this.Attributes[index]);
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
            command.CommandText = "dbo.[Item.Update]";

            command.Parameters.Append(command.CreateParameter("@ItemID", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, this.ItemID));
            command.Parameters.Append(command.CreateParameter("@ItemName", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, String(this.ItemName)));
            command.Parameters.Append(command.CreateParameter("@ItemType", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, String(this.ItemType)));
            command.Parameters.Append(command.CreateParameter("@Usage", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, String(this.Usage)));
            command.Parameters.Append(command.CreateParameter("@Description", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 1024, String(this.Description)));
            command.Parameters.Append(command.CreateParameter("@Material", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, String(this.Material)));

            var parameter = command.CreateParameter("@DamageRating", ADODBParameterType.Decimal, ADODBParameterDirection.Input);
            parameter.Value = parseFloat(this.DamageRating);
            parameter.NumericScale = 2;
            parameter.Precision = 18
            command.Parameters.Append(parameter);

            parameter = command.CreateParameter("@Weight", ADODBParameterType.Decimal, ADODBParameterDirection.Input);
            parameter.Value = parseFloat(this.Weight);
            parameter.NumericScale = 2;
            parameter.Precision = 18
            command.Parameters.Append(parameter);

            command.Parameters.Append(command.CreateParameter("@Absorbtion", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.Absorbtion)));
            command.Parameters.Append(command.CreateParameter("@MinimumAbsorbtion", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.MinimumAbsorbtion)));
            command.Parameters.Append(command.CreateParameter("@Encumberance", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.Encumberance)));
            command.Parameters.Append(command.CreateParameter("@OffensiveBonus", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.OffensiveBonus)));
            command.Parameters.Append(command.CreateParameter("@Dodge", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.Dodge)));
            command.Parameters.Append(command.CreateParameter("@Parry", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.Parry)));
            command.Parameters.Append(command.CreateParameter("@Bulk", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.Bulk)));
            command.Parameters.Append(command.CreateParameter("@ToHit", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.ToHit)));
            command.Parameters.Append(command.CreateParameter("@ToDamage", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.ToDamage)));
            command.Parameters.Append(command.CreateParameter("@BreakPercentage", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.BreakPercentage)));
            command.Parameters.Append(command.CreateParameter("@Capacity", ADODBParameterType.Int, ADODBParameterDirection.Input, Number.MAX_SAFE_INTEGER, parseInt(this.Capacity)));
            command.Parameters.Append(command.CreateParameter("@Attributes", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 1024, attributes));
            command.Parameters.Append(command.CreateParameter("@Affections", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 1024, String(affections)));

            command.Execute();

        } catch (caught) {
            throw new JMCException("Failure Updating Item: " + caught.message);
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