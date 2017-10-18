function JMCException(message) {
    this.message = message;
}

JMCException.prototype = new Error();
JMCException.prototype.name = "JMCException";
JMCException.prototype.constructor = JMCException;

JMCException.LogException = function(message) {

    var databaseConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");

    databaseConnection.ConnectionString = "Provider=MSDASQL.1;Password=P@ssw0rd;Persist Security Info=True;User ID=JMCMudClient;Data Source=RotS;Initial Catalog=RotS";
    databaseConnection.Open();

    try {
        command.ActiveConnection = databaseConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[Exception.LogException]";
        command.Parameters.Append(command.CreateParameter("@ExceptionMessage", ADODBParameterType.NVarChar, ADODBParameterDirection.Input, 5000, message));
        command.Execute();

    } catch (caught) {
        var message = "Failure Logging Exception: " + caught.message;
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    } finally {
        if (databaseConnection.State === 1) {
            databaseConnection.Close();
            databaseConnection = null;
        }
    }
};