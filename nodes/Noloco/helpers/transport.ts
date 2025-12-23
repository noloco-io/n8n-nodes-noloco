import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

import { BASE_API_URL, GRAPHQL_FORMAT } from './constants';
import type {
	GetMeResponse,
	GetAppsResponse,
	GetTablesResponse,
	GetTableResponse,
	GetRecordsResponse,
	GetRecordResponse,
	CreateRecordResponse,
	UpdateRecordResponse,
	DeleteRecordResponse,
	GetRecordsParams,
	GetRecordParams,
	CreateRecordParams,
	RecordInput,
	FilterSchema,
} from './interfaces';

type NolocoContext = IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions;

/**
 * Make an authenticated request to the Noloco API
 */
export async function nolocoApiRequest(
	this: NolocoContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<unknown> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_API_URL}${endpoint}`,
		json: true,
		body,
		qs,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'nolocoApi', options);
}

/**
 * Fetch current user information
 */
export async function fetchMe(this: NolocoContext): Promise<GetMeResponse> {
	return nolocoApiRequest.call(this, 'GET', '/v1/meta/me') as Promise<GetMeResponse>;
}

/**
 * Fetch all apps the user has access to
 */
export async function fetchApps(this: NolocoContext): Promise<GetAppsResponse> {
	return nolocoApiRequest.call(this, 'GET', '/v1/meta/apps') as Promise<GetAppsResponse>;
}

/**
 * Fetch all tables in a project
 */
export async function fetchProjectTables(
	this: NolocoContext,
	projectName: string,
): Promise<GetTablesResponse> {
	return nolocoApiRequest.call(
		this,
		'GET',
		`/v1/schema/${projectName}`,
	) as Promise<GetTablesResponse>;
}

/**
 * Fetch table fields including relationship data types
 * Uses format=input to get sub-field definitions with options for OBJECT fields
 */
export async function fetchProjectTableFields(
	this: NolocoContext,
	projectName: string,
	dataTypeName: string,
): Promise<GetTableResponse> {
	return nolocoApiRequest.call(
		this,
		'GET',
		`/v1/schema/${projectName}/${dataTypeName}`,
		undefined,
		{ include: '', format: 'input' },
	) as Promise<GetTableResponse>;
}

/**
 * Fetch records from a table with optional filtering and pagination
 */
export async function fetchProjectRecords(
	this: NolocoContext,
	projectName: string,
	dataTypeName: string,
	params: GetRecordsParams = {},
): Promise<GetRecordsResponse> {
	const qs: IDataObject = {
		response_format: GRAPHQL_FORMAT,
		sortBy: params.sortBy ?? 'createdAt',
		orderBy: params.orderBy ?? 'DESC',
		first: String(params.first ?? 10),
	};

	if (params.after) {
		qs.after = params.after;
	}

	if (params.before) {
		qs.before = params.before;
	}

	if (params.filter) {
		qs.filter = JSON.stringify(params.filter);
	}

	if (params.include && params.include.length > 0) {
		qs.include = params.include.join(',');
	}

	return nolocoApiRequest.call(
		this,
		'GET',
		`/v1/data/${projectName}/${dataTypeName}`,
		undefined,
		qs,
	) as Promise<GetRecordsResponse>;
}

/**
 * Fetch a single record by ID
 */
export async function fetchProjectRecord(
	this: NolocoContext,
	projectName: string,
	dataTypeName: string,
	id: string | number,
	params: GetRecordParams = {},
): Promise<GetRecordResponse> {
	const qs: IDataObject = {
		response_format: GRAPHQL_FORMAT,
	};

	if (params.include && params.include.length > 0) {
		qs.include = params.include.join(',');
	}

	return nolocoApiRequest.call(
		this,
		'GET',
		`/v1/data/${projectName}/${dataTypeName}/${id}`,
		undefined,
		qs,
	) as Promise<GetRecordResponse>;
}

/**
 * Create a new record in a table
 */
export async function createProjectRecord(
	this: NolocoContext,
	projectName: string,
	dataTypeName: string,
	payload: RecordInput,
	params: CreateRecordParams = {},
): Promise<CreateRecordResponse> {
	const qs: IDataObject = {
		response_format: GRAPHQL_FORMAT,
	};

	if (params.include && params.include.length > 0) {
		qs.include = params.include.join(',');
	}

	return nolocoApiRequest.call(
		this,
		'POST',
		`/v1/data/${projectName}/${dataTypeName}`,
		payload as IDataObject,
		qs,
	) as Promise<CreateRecordResponse>;
}

/**
 * Update an existing record
 */
export async function updateProjectRecord(
	this: NolocoContext,
	projectName: string,
	dataTypeName: string,
	id: string | number,
	payload: RecordInput,
): Promise<UpdateRecordResponse> {
	const qs: IDataObject = {
		response_format: GRAPHQL_FORMAT,
	};

	return nolocoApiRequest.call(
		this,
		'PUT',
		`/v1/data/${projectName}/${dataTypeName}/${id}`,
		payload as IDataObject,
		qs,
	) as Promise<UpdateRecordResponse>;
}

/**
 * Delete a record
 */
export async function deleteProjectRecord(
	this: NolocoContext,
	projectName: string,
	dataTypeName: string,
	id: string | number,
	params: { include?: string[] } = {},
): Promise<DeleteRecordResponse> {
	const qs: IDataObject = {
		response_format: GRAPHQL_FORMAT,
	};

	if (params.include && params.include.length > 0) {
		qs.include = params.include.join(',');
	}

	return nolocoApiRequest.call(
		this,
		'DELETE',
		`/v1/data/${projectName}/${dataTypeName}/${id}`,
		undefined,
		qs,
	) as Promise<DeleteRecordResponse>;
}

/**
 * Search for records using a filter
 */
export async function searchProjectRecords(
	this: NolocoContext,
	projectName: string,
	dataTypeName: string,
	filter: FilterSchema,
	limit: number = 1,
): Promise<GetRecordsResponse> {
	return fetchProjectRecords.call(this, projectName, dataTypeName, {
		first: limit,
		filter,
	});
}

