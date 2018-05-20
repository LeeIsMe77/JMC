//HELP
//HELP QUEST
//HELP QUEST SILVERY HORSE
//HELP MOB
//HELP MOB KRAKEN
//HELP MOB UNGAMBAR

var myName = "Help Bot";
var _helpbotOn = false;

function ParseForHelpBotLine(cleanLine) {
    try {
        if (!_helpbotOn) return;
        // (/^([a-zA-Z]+) (chat|tell)s(?: you)? 'help(?: (quest|mob)(.*))?'$/i)
        var matches = cleanLine.match(/^([a-zA-Z]+) (tell)s(?: you)? 'help(?: (quest|mob)(.*))?'$/i);
        if (matches !== null) {

            var characterAsking = matches[1];

            var methodForAsking = matches[2];
            var methodOfResponse = (methodForAsking === "chat" ? methodForAsking : characterAsking === "Someone" ? "reply" : "tell " + characterAsking) + " ";
            var helpParameters = matches[4].trim();

            switch (matches[3].trim().toUpperCase()) {
                case "":
                    jmc.Send(methodOfResponse + "Hello, I am HelpBot.  You can call me " + myName + ".  You can ask me for help on mobs and quests.");
                    jmc.Send(methodOfResponse + "The proper syntax is \"HELP <MOB|QUEST> <NAME>\".")
                    break;
                case "QUEST":
                    if (helpParameters === "") {
                        jmc.Send(methodOfResponse + "Which quest would you like help with?  You can say things like \"HELP QUEST ASHEN WARHORSE\".")
                        return;
                    }
                    jmc.Send(methodOfResponse + "I'm sorry.  I can't offer help on the quest " + helpParameters + " right now.  I've logged the request.  Check back later!");
                    break;
                case "MOB":
                    if (helpParameters === "") {
                        jmc.Send(methodOfResponse + "Which mob would you like help with?  You can say things like \"HELP MOB KRAKEN\".")
                        return;
                    }

                    var mobileCollection = MobileCollection.Find(helpParameters);
                    if (mobileCollection === null || mobileCollection.Mobiles.length === 0) {
                        MobileCollection.Request(helpParameters, characterAsking);
                        jmc.Send(methodOfResponse + "I'm sorry.  I can't offer help on the mob " + helpParameters + " right now.  I've logged the request.  Check back later!");
                        return;
                    }

                    var mobile = mobileCollection.Mobiles[0];

                    jmc.Send(methodOfResponse + "Ahhh, " + mobile.MobileName + ", I know of this creature...");
                    jmc.Send(methodOfResponse + mobile.Description);
                    jmc.Send(methodOfResponse + mobile.Location);

                    break;
            }
            return;
        }

        matches = cleanLine.match(/^([a-zA-Z]+) tells(?: you)? '(?!help).*'$/i);
        if (matches !== null) {
            var characterAsking = matches[1].toUpperCase();
            var methodOfResponse = (characterAsking === "SOMEONE" ? "reply" : "tell " + characterAsking) + " ";
            jmc.Send(methodOfResponse + "I'm sorry, I don't understand your request.  Tell me HELP if you would like to learn more.");
            return;
        }
    } catch (caught) {
        var message = "Failure parsing HelpBot: " + caught.message + "\nLine: " + jmc.Event;
        JMCException.LogException(message);
        WriteToWindow(_exceptionOutputWindow, message, "red", true, true);
    }
};

function MobileCollection() {
    this.Mobiles = new Array();
};

function Mobile(mobileName, description, location) {
    this.MobileName = mobileName;
    this.Description = description;
    this.Location = location;
};

MobileCollection.Find = function(mobileName) {

    var mobileCollection = new MobileCollection();

    var databaseConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");
    var recordSet = new ActiveXObject("ADODB.Recordset");

    databaseConnection.ConnectionString = DATABASE_CHARACTER_CONNECTION_STRING;
    databaseConnection.Open();

    try {
        command.ActiveConnection = databaseConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[MobileCollection.Find]";
        command.Parameters.Append(command.CreateParameter("@MobileName", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, mobileName));

        recordSet = command.Execute();

        while (!recordSet.EOF) {

            var mobile = new Mobile(
                String(recordSet("MobileName")),
                String(recordSet("Description")),
                String(recordSet("Location"))
            );

            mobileCollection.Mobiles.push(mobile);
            recordSet.MoveNext();
        }

    } catch (caught) {
        var message = "Failure Finding Mobile: " + caught.message;
        throw new JMCException(message);
    } finally {
        if (databaseConnection.State === 1) {
            databaseConnection.Close();
            databaseConnection = null;
        }
    }
    return mobileCollection;
};

MobileCollection.Request = function(mobileName, requestor) {

    var mobileCollection = new MobileCollection();

    var databaseConnection = new ActiveXObject("ADODB.Connection");
    var command = new ActiveXObject("ADODB.Command");

    databaseConnection.ConnectionString = DATABASE_CHARACTER_CONNECTION_STRING;
    databaseConnection.Open();

    try {
        command.ActiveConnection = databaseConnection;
        command.CommandType = 4;
        command.CommandText = "dbo.[MobileCollection.Request]";
        command.Parameters.Append(command.CreateParameter("@MobileName", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, mobileName));
        command.Parameters.Append(command.CreateParameter("@Requestor", ADODBParameterType.VarChar, ADODBParameterDirection.Input, 128, requestor));

        recordSet = command.Execute();
    } catch (caught) {
        var message = "Failure Requesting Mobile: " + caught.message;
        throw new JMCException(message);
    } finally {
        if (databaseConnection.State === 1) {
            databaseConnection.Close();
            databaseConnection = null;
        }
    }
    return mobileCollection;
};