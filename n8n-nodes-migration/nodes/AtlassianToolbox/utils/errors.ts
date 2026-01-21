import { NodeOperationError } from 'n8n-workflow';

export const ErrorCodes = {
    100: 'Feature Image is required',
    101: 'Feature Image not found',
    200: 'Field Required',
    300: 'JIRA issue not found',
    301: 'Account custom field does not have any values',
    302: 'Account custom field ID is invalid',
    303: 'Description field is required',
    304: 'Too many attachments found. Right now HubSpot does not support more than 4 attachments.',
    305: 'Attachment name is not valid',
};

export function throwCustomError(instance: any, code: keyof typeof ErrorCodes, customMessage?: string) {
    const message = customMessage || ErrorCodes[code];
    throw new NodeOperationError(instance.getNode(), message, {
        description: `Error Code: ${code}`,
    });
}
