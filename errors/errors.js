/*
100: Feature Image is required
101: Feature Image not found
200: HubSpot Additional Data Field required
300: JIRA issue not found
301: Account custom field does not have any values
302: Account custom field ID is invalid
303: Description field is required
304: Too many attachments found. Right now HubSpot doesn't support more than 1 attachment.
*/

class CustomError {
    constructor(code) {
        this._code = code
    }

    get code() {
        return this._code;
    }

    get category() {
        if (this._code <= 199) {
            return 'Confluence-InvalidData';
        } else if (this._code <= 399) {
            return 'Jira-InvalidData';
        }
        return 'Undefined error category';
    }

    get message() {
        switch (this._code) {
            case 100:
                return 'Feature Image is required';
            case 101:
                return 'Feature Image not found';
            case 300:
                return 'JIRA issue not found';
            case 301:
                return 'Account custom field does not have any values';
            case 302:
                return 'Account custom field ID is invalid';
            case 303:
                return 'Description field is required';
            case 304:
                return 'Too many attachments found. Right now HubSpot does not support more than 1 attachment.'
            default:
                return 'Undefine error message';
        }
    }
}


class FieldRequiredError {
    constructor(fieldName) {
        this._fieldName = fieldName
    }

    get code() {
        return 200;
    }

    get fieldName() {
        return this._fieldName;
    }

    get category() {
        return 'HubSpot Additional Data Field required'
    }

    get message() {
        return `${this.fieldName} is required`
    }
}

module.exports = {
    throwError: (z, errorObj) => {
        throw new z.errors.Error(errorObj.message, errorObj.category, errorObj.code);
    },
    customError: CustomError,
    fieldRequiredError: FieldRequiredError
}