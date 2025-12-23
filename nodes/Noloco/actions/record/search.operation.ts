import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { updateDisplayOptions } from '../../helpers/utils';
import { fetchProjectRecords } from '../../helpers/transport';
import type { FilterSchema } from '../../helpers/interfaces';

const properties: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filter Mode',
		name: 'filterMode',
		type: 'options',
		options: [
			{
				name: 'UI Builder',
				value: 'builder',
				description: 'Use the visual filter builder',
			},
			{
				name: 'Custom Query (JSON)',
				value: 'query',
				description: 'Enter a custom JSON filter query',
			},
		],
		default: 'builder',
		description: 'How to specify the filter conditions',
	},
	{
		displayName: 'Filter Records',
		name: 'where',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Condition',
		default: {},
		description: 'If not set, all records will be returned',
		displayOptions: {
			show: {
				filterMode: ['builder'],
			},
		},
		options: [
			{
				displayName: 'Conditions',
				name: 'conditions',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'field',
						type: 'options',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
						default: '',
						placeholder: 'e.g. email',
						typeOptions: {
							loadOptionsMethod: 'getSearchableFields',
							loadOptionsDependsOn: ['app', 'dataType'],
						},
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						description: 'The operator to use for comparison',
						options: [
							{
								name: 'Contains',
								value: 'contains',
							},
							{
								name: 'Equals',
								value: 'equals',
							},
							{
								name: 'Greater Than',
								value: 'gt',
							},
							{
								name: 'Greater Than or Equal',
								value: 'gte',
							},
							{
								name: 'In (List)',
								value: 'in',
							},
							{
								name: 'Less Than',
								value: 'lt',
							},
							{
								name: 'Less Than or Equal',
								value: 'lte',
							},
							{
								name: 'Not Equals',
								value: 'not_equals',
							},
							{
								name: 'Not In (List)',
								value: 'notIn',
							},
						],
						default: 'equals',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description:
							'The value to compare against. For "In" and "Not In" operators, use comma-separated values.',
					},
				],
			},
		],
	},
	{
		displayName: 'Custom Query',
		name: 'customQuery',
		type: 'json',
		displayOptions: {
			show: {
				filterMode: ['query'],
			},
		},
		default: '',
		description:
			'Custom filter query in JSON format. Example: {"FIELD_API_NAME": {"OPERATOR": VALUE}}. E.g. {"uuid": {"equals": "abc123"}} or {"email": {"contains": "@example.com"}}. Check your table schema for available fields. Supported operators: equals, contains, in, notIn, gt, gte, lt, lte, not.',
		placeholder: '{"email": {"contains": "@example.com"}}',
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Sort Rule',
		default: {},
		options: [
			{
				displayName: 'Sort Rules',
				name: 'rules',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'field',
						type: 'options',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
						default: '',
						typeOptions: {
							loadOptionsMethod: 'getSearchableFields',
							loadOptionsDependsOn: ['app', 'dataType'],
						},
					},
					{
						displayName: 'Direction',
						name: 'direction',
						type: 'options',
						options: [
							{
								name: 'Ascending',
								value: 'ASC',
							},
							{
								name: 'Descending',
								value: 'DESC',
							},
						],
						default: 'DESC',
					},
				],
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['record'],
		operation: ['search'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const projectName = this.getNodeParameter('app', i, '', {
				extractValue: true,
			}) as string;
			const dataType = this.getNodeParameter('dataType', i, '', {
				extractValue: true,
			}) as string;

			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const limit = returnAll ? 100 : (this.getNodeParameter('limit', i) as number);
			const filterMode = this.getNodeParameter('filterMode', i, 'builder') as string;

			let filter: FilterSchema | undefined;

			if (filterMode === 'query') {
				// Custom JSON query mode
				const customQuery = this.getNodeParameter('customQuery', i, '') as string;
				if (customQuery) {
					try {
						filter = JSON.parse(customQuery) as FilterSchema;
					} catch {
						throw new NodeOperationError(
							this.getNode(),
							'Invalid JSON in custom query. Please ensure your filter is valid JSON.',
							{ itemIndex: i },
						);
					}
				}
			} else {
				// UI Builder mode
				const whereParam = this.getNodeParameter('where', i, {}) as IDataObject;
				const conditions = (whereParam.conditions as IDataObject[]) || [];

				if (conditions.length > 0) {
					// Noloco API only supports AND for combining different field conditions
					// (OR is only available at field-level, not across fields)
					filter = {};

					for (const condition of conditions) {
						const field = condition.field as string;
						const operator = condition.operator as string;
						let value: unknown = condition.value as string;

						// Parse list values for 'in' and 'notIn' operators
						if (operator === 'in' || operator === 'notIn') {
							value = (value as string).split(',').map((v) => v.trim());
						}

						// Handle 'not_equals' operator
						if (operator === 'not_equals') {
							filter[field] = { not: { equals: value } };
						} else {
							filter[field] = { [operator]: value };
						}
					}
				}
			}

			// Build sort from sort rules
			const sortParam = this.getNodeParameter('sort', i, {}) as IDataObject;
			const sortRules = (sortParam.rules as IDataObject[]) || [];

			// Use first sort rule if provided
			let sortBy: 'createdAt' | 'updatedAt' | undefined;
			let orderBy: 'ASC' | 'DESC' = 'DESC';

			if (sortRules.length > 0) {
				const firstRule = sortRules[0];
				const sortField = firstRule.field as string;
				if (sortField === 'createdAt' || sortField === 'updatedAt') {
					sortBy = sortField;
				}
				orderBy = (firstRule.direction as 'ASC' | 'DESC') || 'DESC';
			}

			const allRecords: IDataObject[] = [];
			let cursor: string | undefined;
			let hasMore = true;

			while (hasMore) {
				const result = await fetchProjectRecords.call(this, projectName, dataType, {
					first: Math.min(limit, 100),
					sortBy,
					orderBy,
					include: ['*'],
					filter,
					after: cursor,
				});

				for (const record of result.records) {
					allRecords.push(record as unknown as IDataObject);
					if (!returnAll && allRecords.length >= limit) {
						hasMore = false;
						break;
					}
				}

				if (returnAll && result.pageInfo.hasNextPage && result.pageInfo.endCursor) {
					cursor = result.pageInfo.endCursor;
				} else {
					hasMore = false;
				}
			}

			for (const record of allRecords) {
				returnData.push({
					json: record,
					pairedItem: { item: i },
				});
			}
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: (error as Error).message },
					pairedItem: { item: i },
				});
				continue;
			}
			throw error;
		}
	}

	return returnData;
}
