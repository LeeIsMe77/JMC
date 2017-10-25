if (!String.prototype.capitalizeFirstLetter) {
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    };
};

if (!String.prototype.cleanString) {
    String.prototype.cleanString = function() {
        return this
            //First, remove all byte order marks and ANSI color codes matching [30m or [0m pattern.
            .replace(/[\u001b]\[\d+m/g, '')
            //...and finally, strip off health status and right angle bracket at beginning of line, if it exists...
            .replace(/^R? ?(?:(?:Mind|Mount|HP|MV|S):[a-zA-Z ]+ ?)*(?:, [a-zA-Z,' ]+:[a-zA-Z ]+)*?>/, '')
    };
};

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        // This works much better than >= because it compensates for NaN:
        if (!(position < this.length))
            position = this.length;
        else
            position |= 0; // round position
        return this.substr(position - searchString.length, searchString.length) === searchString;
    };
};

if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(
            /{(\d+)}/g,
            function(match, number) {
                return typeof args[number] != 'undefined' ?
                    args[number] :
                    match;
            }
        );
    };
};

if (!String.prototype.padLeft) {
    String.prototype.padLeft = function(paddingChar, length) {
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

if (!String.prototype.padRight) {
    String.prototype.padRight = function(paddingChar, length) {
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

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        return this.substr(position || 0, searchString.length) === searchString;
    };
};

if (!String.prototype.toTitleCase) {
    String.prototype.toTitleCase = function() {
        return this.replace(
            /\w\S*/g,
            function(text) {
                return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
            }
        );
    };
};

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
};

if (!String.prototype.toFriendlyDateString) {
    Date.prototype.toFriendlyDateString = function() {
        var month = '' + (this.getMonth() + 1);
        var day = '' + this.getDate();
        var year = this.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    };
};

if (!String.prototype.splice) {
    String.prototype.splice = function(startIndex, charactersToRemove, stringToInsert) {
        return this.slice(0, startIndex) + stringToInsert + this.slice(startIndex + Math.abs(charactersToRemove));
    };
};