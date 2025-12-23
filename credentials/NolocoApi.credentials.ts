import type {
	IAuthenticateGeneric,
	IconFile,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NolocoApi implements ICredentialType {
	name = 'nolocoApi';
	icon = 'file:../icons/noloco.svg' as IconFile;

	displayName = 'Noloco API';

	documentationUrl = 'https://guides.noloco.io/settings/integrations-and-api-keys#api-keys';

	properties: INodeProperties[] = [
		{
			displayName: 'Account API Key',
			name: 'accountKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Copy the "Account API Key" field from the integration settings page in your app settings',
		},
		{
			displayName: 'App API Key',
			name: 'appKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Copy the "App API Key" from the integration settings page in your app settings',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accountKey}}',
				'X-Noloco-App-Token': '=Bearer {{$credentials.appKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.portals.noloco.io',
			url: '/v1/meta/me',
			method: 'GET',
		},
	};
}
