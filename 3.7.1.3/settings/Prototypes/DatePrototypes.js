if (!Date.prototype.padLeft) {
    Date.prototype.padLeft = function(paddingChar, length) {
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
};

if (!Date.prototype.padRight) {
    Date.prototype.padRight = function(paddingChar, length) {
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
};

if (!Date.prototype.toFriendlyDate) {
    Date.prototype.toFriendlyDate = function() {
        var year = String(this.getFullYear());
        var month = String(this.getMonth() + 1).padLeft("0", 2);
        var day = String(this.getDate()).padLeft("0", 2);
        var hour = String(this.getHours()).padLeft("0", 2);
        var minute = String(this.getMinutes()).padLeft("0", 2);
        var second = String(this.getSeconds()).padLeft("0", 2);
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    };
};