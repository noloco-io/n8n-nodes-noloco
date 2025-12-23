import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as del from './delete.operation';
import * as get from './get.operation';
import * as getMany from './getMany.operation';
import * as search from './search.operation';
import * as update from './update.operation';

// Re-export operations with their execute functions
// Note: 'delete' is a reserved word, so we use 'del' internally
export { create, get, getMany, update, search };
export { del as delete };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['record'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a record',
				description: 'Create a new record in a collection',
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a record',
				description: 'Delete an existing record from a collection',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a record',
				description: 'Get a single record by ID',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many records',
				description: 'Get many records from a collection',
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search records',
				description: 'Search for records by field values',
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a record',
				description: 'Update an existing record in a collection',
			},
		],
		default: 'getMany',
	},
	...create.description,
	...del.description,
	...get.description,
	...getMany.description,
	...search.description,
	...update.description,
];
