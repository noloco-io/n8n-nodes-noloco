import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';

import { updateDisplayOptions } from '../../helpers/utils';
import { createProjectRecord } from '../../helpers/transport';
import type { RecordInput } from '../../helpers/interfaces';
import { fieldsResourceMapper } from '../common.descriptions';

const properties: INodeProperties[] = [
	{
		...fieldsResourceMapper,
		description: 'The fields and values to set on the new record',
	},
];

const displayOptions = {
	show: {
		resource: ['record'],
		operation: ['create'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

/**
 * Transform resourceMapper values to API payload format
 * Handles OBJECT type sub-fields (e.g., address__city -> address.city)
 */
function transformResourceMapperToPayload(values: IDataObject): RecordInput {
	const payload: RecordInput = {};

	for (const [key, value] of Object.entries(values)) {
		if (value === undefined || value === null) {
			continue;
		}

		// Check if this is an OBJECT sub-field (contains __)
		if (key.includes('__')) {
			const [parentField, subField] = key.split('__');
			if (!payload[parentField]) {
				payload[parentField] = {};
			}
			(payload[parentField] as Record<string, unknown>)[subField] = value;
		} else {
			payload[key] = value;
		}
	}

	return payload;
}

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

			const fieldsParam = this.getNodeParameter('fields', i) as IDataObject;
			const mappingMode = fieldsParam.mappingMode as string;

			let payload: RecordInput;

			if (mappingMode === 'autoMapInputData') {
				// Auto-map mode: use incoming item data directly
				payload = transformResourceMapperToPayload(items[i].json);
			} else {
				// Define below mode: use the mapped values
				const mappedValues = (fieldsParam.value as IDataObject) ?? {};
				payload = transformResourceMapperToPayload(mappedValues);
			}

			const result = await createProjectRecord.call(this, projectName, dataType, payload);

			returnData.push({
				json: (result ?? { success: true }) as IDataObject,
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
