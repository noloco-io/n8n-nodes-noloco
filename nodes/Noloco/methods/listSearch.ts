import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

import { fetchApps, fetchProjectTables, fetchProjectRecords } from '../helpers/transport';

/**
 * List all apps the user has access to
 */
export async function getApps(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const response = await fetchApps.call(this);

	const results = response.apps.map((app) => ({
		name: app.name,
		value: app.name,
	}));

	return { results };
}

/**
 * List all tables in the selected project/app
 */
export async function getTables(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const projectName = this.getCurrentNodeParameter('app', { extractValue: true }) as string;

	if (!projectName) {
		return { results: [] };
	}

	const response = await fetchProjectTables.call(this, projectName);

	let tables = response.tables.filter((table) => table.enabled);

	// Apply filter if provided
	if (filter) {
		const filterLower = filter.toLowerCase();
		tables = tables.filter(
			(table) =>
				table.display.toLowerCase().includes(filterLower) ||
				table.apiName.toLowerCase().includes(filterLower),
		);
	}

	const results = tables.map((table) => ({
		name: table.display,
		value: table.apiName,
	}));

	return { results };
}

/**
 * List records from the selected table for use in dropdowns
 */
export async function getRecords(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const projectName = this.getCurrentNodeParameter('app', { extractValue: true }) as string;
	const dataType = this.getCurrentNodeParameter('dataType', { extractValue: true }) as string;

	if (!projectName || !dataType) {
		return { results: [] };
	}

	const page = paginationToken ? parseInt(paginationToken, 10) : 1;
	const perPage = 100;

	const response = await fetchProjectRecords.call(this, projectName, dataType, {
		first: perPage,
		after: paginationToken && page > 1 ? paginationToken : undefined,
		sortBy: 'createdAt',
		orderBy: 'DESC',
	});

	const results = response.records.map((record) => {
		// Try to find a display name from common fields
		const displayName =
			(record.name as string) ||
			(record.title as string) ||
			(record.email as string) ||
			(record.display as string) ||
			`Record #${record.id}`;

		return {
			name: displayName,
			value: String(record.id),
		};
	});

	// Filter results if a filter string is provided
	const filteredResults = filter
		? results.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
		: results;

	const nextPaginationToken = response.pageInfo.hasNextPage
		? response.pageInfo.endCursor
		: undefined;

	return {
		results: filteredResults,
		paginationToken: nextPaginationToken,
	};
}

