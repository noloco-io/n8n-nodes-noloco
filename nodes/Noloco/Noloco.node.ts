import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { router } from './actions/router';
import * as record from './actions/record/Record.resource';
import { appRLC, dataTypeRLC } from './actions/common.descriptions';
import { listSearch, loadOptions, resourceMapping } from './methods';

export class Noloco implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Noloco',
		name: 'noloco',
		icon: 'file:../../icons/noloco.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Noloco records',
		defaults: {
			name: 'Noloco',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'nolocoApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Record',
						value: 'record',
					},
				],
				default: 'record',
			},
			appRLC,
			dataTypeRLC,
			...record.description,
		],
	};

	methods = {
		listSearch,
		loadOptions,
		resourceMapping,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await router.call(this);
	}
}
