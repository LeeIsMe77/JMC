$NetworkCredentialName = "Enter your GMail account name."
$NetworkCredentialPassword = "Enter your GMail password or application key."
$EmailFrom = "Enter your desired 'from' email address here."
$EmailTo = $args[0]
$Subject=$args[1]
$Body=$args[2]

$SMTPServer = “smtp.gmail.com”
$SMTPClient = New-Object Net.Mail.SmtpClient($SmtpServer, 587)
$SMTPClient.EnableSsl = $true
$SMTPClient.Credentials = New-Object System.Net.NetworkCredential($NetworkCredentialName, $NetworkCredentialPassword);
$SMTPClient.Send($EmailFrom, $EmailTo, $Subject, $Body)
