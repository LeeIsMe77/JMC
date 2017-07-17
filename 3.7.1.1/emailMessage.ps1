$EmailTo = $args[0]
$Subject=$args[1]
$Body=$args[2]
$EmailFrom = "LeePiAutomation@gmail.com"

$SMTPServer = “smtp.gmail.com”
$SMTPClient = New-Object Net.Mail.SmtpClient($SmtpServer, 587)
$SMTPClient.EnableSsl = $true
$SMTPClient.Credentials = New-Object System.Net.NetworkCredential("LeePiAutomation", "mquniucfhnkxogdn");
$SMTPClient.Send($EmailFrom, $EmailTo, $Subject, $Body)
