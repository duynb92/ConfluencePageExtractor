import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AtlassianToolboxOAuth2Api implements ICredentialType {
    name = 'atlassianToolboxOAuth2Api';

    extends = ['oAuth2Api'];

    displayName = 'Atlassian Toolbox OAuth2 API';

    documentationUrl = 'https://developer.atlassian.com/cloud/confluence/oauth-2-3lo-google-v2/';

    properties: INodeProperties[] = [
        {
            displayName: 'Grant Type',
            name: 'grantType',
            type: 'hidden',
            default: 'authorizationCode',
        },
        {
            displayName: 'Authorization URL',
            name: 'authUrl',
            type: 'hidden',
            default: 'https://auth.atlassian.com/authorize',
            required: true,
        },
        {
            displayName: 'Access Token URL',
            name: 'accessTokenUrl',
            type: 'hidden',
            default: 'https://auth.atlassian.com/oauth/token',
            required: true,
        },
        {
            displayName: 'Scope',
            name: 'scope',
            type: 'hidden',
            default: 'read:page:confluence read:attachment:confluence offline_access read:jira-work',
        },
        {
            displayName: 'Auth URI Query Parameters',
            name: 'authQueryParameters',
            type: 'hidden',
            default: 'audience=api.atlassian.com&prompt=consent',
        },
        {
            displayName: 'Authentication',
            name: 'authentication',
            type: 'hidden',
            default: 'body', // Atlassian token endpoint expects client_id/secret in body
        },
    ];
}
