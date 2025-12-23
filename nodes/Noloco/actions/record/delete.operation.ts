import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';

import { updateDisplayOptions } from '../../helpers/utils';
import { deleteProjectRecord } from '../../helpers/transport';
import { recordIdRLC } from '../common.descriptions';

const properties: INodeProperties[] = [
	{
		...recordIdRLC,
		description: 'The ID of the record to delete',
	},
];

const displayOptions = {
	show: {
		resource: ['record'],
		operation: ['delete'],
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
			const recordId = this.getNodeParameter('recordId', i, '', {
				extractValue: true,
			}) as string;

			const result = await deleteProjectRecord.call(this, projectName, dataType, recordId);

			returnData.push({
				json: (result ?? { success: true, id: recordId }) as IDataObject,
				pairedItem: { item: i },
			});
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
