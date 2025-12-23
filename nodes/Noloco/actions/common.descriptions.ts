import type { INodeProperties } from 'n8n-workflow';

/**
 * App selector - used across all operations
 */
export const appRLC: INodeProperties = {
	displayName: 'App',
	name: 'app',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select an app...',
			typeOptions: {
				searchListMethod: 'getApps',
				searchable: false,
			},
		},
		{
			displayName: 'By Name',
			name: 'name',
			type: 'string',
			placeholder: 'e.g. my-app',
		},
	],
	description: 'The Noloco app to work with',
};

/**
 * Table/DataType selector - used across all operations
 */
export const dataTypeRLC: INodeProperties = {
	displayName: 'Table',
	name: 'dataType',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a table...',
			typeOptions: {
				searchListMethod: 'getTables',
				searchable: true,
			},
		},
		{
			displayName: 'By API Name',
			name: 'name',
			type: 'string',
			placeholder: 'e.g. user',
		},
	],
	description: 'The table (data type) to work with',
};

/**
 * Record ID selector - used for get, update, delete
 */
export const recordIdRLC: INodeProperties = {
	displayName: 'Record ID',
	name: 'recordId',
	type: 'resourceLocator',
	default: { mode: 'id', value: '' },
	required: true,
	modes: [
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			placeholder: 'e.g. 123',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '^[0-9]+$',
						errorMessage: 'Record ID must be a number',
					},
				},
			],
		},
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			placeholder: 'Select a record...',
			typeOptions: {
				searchListMethod: 'getRecords',
				searchable: true,
			},
		},
	],
	description: 'The ID of the record',
};

/**
 * Resource mapper for fields
 */
export const fieldsResourceMapper: INodeProperties = {
	displayName: 'Fields',
	name: 'fields',
	type: 'resourceMapper',
	noDataExpression: true,
	default: {
		mappingMode: 'defineBelow',
		value: null,
	},
	required: true,
	typeOptions: {
		loadOptionsDependsOn: ['app', 'dataType'],
		resourceMapper: {
			resourceMapperMethod: 'getMappingColumns',
			mode: 'add',
			fieldWords: {
				singular: 'field',
				plural: 'fields',
			},
			addAllFields: true,
			multiKeyMatch: false,
		},
	},
	description: 'The fields and values to set on the record',
};

