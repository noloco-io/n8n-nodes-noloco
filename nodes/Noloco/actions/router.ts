import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import * as record from './record/Record.resource';
import type { NolocoType } from './node.type';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	let returnData: INodeExecutionData[] = [];

	const resource = this.getNodeParameter('resource', 0) as string;
	const operation = this.getNodeParameter('operation', 0) as string;

	const nolocoNodeData = {
		resource,
		operation,
	} as NolocoType;

	switch (nolocoNodeData.resource) {
		case 'record':
			returnData = await record[nolocoNodeData.operation].execute.call(this, items);
			break;
		default:
			throw new Error(`The resource "${resource}" is not supported!`);
	}

	return [returnData];
}

