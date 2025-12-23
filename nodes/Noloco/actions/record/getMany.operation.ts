import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
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
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{
						name: 'Created At',
						value: 'createdAt',
					},
					{
						name: 'Updated At',
						value: 'updatedAt',
					},
				],
				default: 'createdAt',
				description: 'The field to sort by',
			},
			{
				displayName: 'Order',
				name: 'orderBy',
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
				description: 'The sort order',
			},
			{
				displayName: 'Filter (JSON)',
				name: 'filter',
				type: 'json',
				default: '',
				description: 'Filter records using Noloco filter syntax (JSON format)',
			},
		],
	},
];

const displayOptions = {
	show: {
		resource: ['record'],
		operation: ['getMany'],
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
			const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

			const sortBy = (additionalOptions.sortBy as 'createdAt' | 'updatedAt') ?? 'createdAt';
			const orderBy = (additionalOptions.orderBy as 'ASC' | 'DESC') ?? 'DESC';

			let filter: FilterSchema | undefined;
			if (additionalOptions.filter) {
				try {
					filter = JSON.parse(additionalOptions.filter as string) as FilterSchema;
				} catch {
					throw new NodeOperationError(this.getNode(), 'Invalid filter JSON format');
				}
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

