import {
	type IPollFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IDataObject,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { getApps, getTables } from './methods/listSearch';
import { fetchProjectRecords } from './helpers/transport';
import type { FormattedRecord } from './helpers/interfaces';

export class NolocoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Noloco Trigger',
		name: 'nolocoTrigger',
		icon: 'file:../../icons/noloco.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers when records are created or updated in Noloco',
		defaults: {
			name: 'Noloco Trigger',
		},
		polling: true,
		inputs: [],
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
				description: 'The Noloco app to watch',
			},
			{
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
				description: 'The table (data type) to watch',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Record Created',
						value: 'recordCreated',
						description: 'Triggers when a new record is created',
					},
					{
						name: 'Record Updated',
						value: 'recordUpdated',
						description: 'Triggers when a record is updated',
					},
				],
				default: 'recordCreated',
				description: 'The event to listen for',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Related Data',
						name: 'include',
						type: 'string',
						default: '',
						description:
							'Comma-separated list of relationship field API names to include in the response',
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			getApps,
			getTables,
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const projectName = this.getNodeParameter('app', '', {
			extractValue: true,
		}) as string;
		const dataType = this.getNodeParameter('dataType', '', {
			extractValue: true,
		}) as string;
		const event = this.getNodeParameter('event') as string;
		const options = this.getNodeParameter('options') as IDataObject;

		const sortBy = event === 'recordUpdated' ? 'updatedAt' : 'createdAt';

		const include = options.include
			? (options.include as string).split(',').map((s) => s.trim())
			: undefined;

		// Get the last processed timestamp from static data
		const staticData = this.getWorkflowStaticData('node');
		const lastTimestamp = staticData.lastTimestamp as string | undefined;

		// Fetch recent records
		const response = await fetchProjectRecords.call(this, projectName, dataType, {
			first: 100,
			sortBy,
			orderBy: 'DESC',
			include,
		});

		if (response.records.length === 0) {
			return null;
		}

		// Filter to only new records since last poll
		let newRecords: FormattedRecord[];

		if (lastTimestamp) {
			const lastDate = new Date(lastTimestamp);
			newRecords = response.records.filter((record: FormattedRecord) => {
				const recordDate = new Date(
					event === 'recordUpdated' ? (record.updatedAt ?? record.createdAt) : record.createdAt,
				);
				return recordDate > lastDate;
			});
		} else {
			// First run - only return the most recent record to establish baseline
			// This prevents triggering for all existing records on first run
			const isManualRun = this.getMode() === 'manual';
			if (isManualRun) {
				// For manual runs, return a sample of records
				newRecords = response.records.slice(0, 5);
			} else {
				// For automatic runs, just set the baseline and return nothing
				newRecords = [];
			}
		}

		// Update the last timestamp to the most recent record
		if (response.records.length > 0) {
			const mostRecentRecord = response.records[0];
			staticData.lastTimestamp =
				event === 'recordUpdated'
					? (mostRecentRecord.updatedAt ?? mostRecentRecord.createdAt)
					: mostRecentRecord.createdAt;
		}

		if (newRecords.length === 0) {
			return null;
		}

		// Return new records as execution data
		const returnData: INodeExecutionData[] = newRecords.map((record: FormattedRecord) => ({
			json: record as unknown as IDataObject,
		}));

		return [returnData];
	}
}
