#Email From
$EmailFrom = "ENTERADDRESSWHEREEMAILORIGINATES"

#EmailTo
$EmailTo = $args[0]

#Subject
$Subject = $args[1]

#Body
$Body = $args[2]

#SMTP Server Name
$SMTPServer = “ENTERYOURSMTPSERVERHERE”

#SMTP Port
$SMTPPort = 587

#Username
$UserName = "ENTERYOURUSERNAMEHERE"

#Password
$Password = "ENTERYOURPASSWORDHERE

#EnableSsl
$EnableSsl = true

$SMTPClient = New-Object Net.Mail.SmtpClient($SMTPServer, $SMTPPort)
$SMTPClient.EnableSsl = $EnableSsl
$SMTPClient.Credentials = New-Object System.Net.NetworkCredential($UserName, $Password);
$SMTPClient.Send($EmailFrom, $EmailTo, $Subject, $Body)
