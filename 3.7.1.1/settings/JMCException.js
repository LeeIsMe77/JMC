function JMCException(message) {
    this.message = message;
}

JMCException.prototype = new Error();
JMCException.prototype.name = "JMCException";
JMCException.prototype.constructor = JMCException;

JMCException.LogException = function(message) {

    var testConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");

    testConnection.ConnectionString = "Provider=MSDASQL.1;Password=P@ssw0rd;Persist Security Info=True;User ID=jmcMudClient;Data Source=RotS;Initial Catalog=RotS";
    testConnection.Open();

    try {

        command.ActiveConnection = testConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[Exception.LogException]";
        command.Parameters.Append(command.CreateParameter("@ExceptionMessage", 200, 1, 100, message));
        command.Execute();

    } catch (caught) {
        var message = "Failure Logging Exception: " + caught.message;
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    } finally {
        if (testConnection.State === 1) {
            testConnection.Close();
            testConnection = null;
        }
    }
};