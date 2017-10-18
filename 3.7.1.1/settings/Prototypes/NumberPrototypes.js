if (!Number.prototype.padLeft) {
    Number.prototype.padLeft = function(paddingChar, length) {
        var returnString = String(this);
        if (paddingChar !== null && paddingChar.length > 0) {
            var paddingCharacter = new String(paddingChar.charAt(0));
            if (returnString.length < length) {
                var desiredLength = length - returnString.length;
                for (var index = 0; index < desiredLength; index++) {
                    returnString = paddingCharacter.concat(returnString);
                }
            }
        }
        return returnString;
    };
}

if (!Number.prototype.padRight) {
    Number.prototype.padRight = function(paddingChar, length) {
        var returnString = new String(this);
        if (paddingChar !== null && paddingChar.length > 0) {
            var paddingCharacter = new String(paddingChar.charAt(0));
            if (returnString.length < length) {
                var desiredLength = length - returnString.length;
                for (var index = 0; index < desiredLength; index++) {
                    returnString = returnString.concat(paddingCharacter);
                }
            }
        }
        return returnString;
    };
}