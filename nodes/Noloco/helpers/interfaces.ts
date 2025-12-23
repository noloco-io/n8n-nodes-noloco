// API Response Types

export interface GetMeResponse {
	userId: number;
	email: string;
	firstName: string;
	lastName: string;
	projectName?: string;
	note?: string;
}

export interface App {
	id: string;
	name: string;
}

export interface GetAppsResponse {
	apps: App[];
}

// Schema Types

export interface Table {
	id: number;
	name: string;
	apiName: string;
	display: string;
	description: string | null;
	enabled: boolean;
	source: DataSourceType;
}

export interface GetTablesResponse {
	tables: Table[];
}

export interface FieldOption {
	id: number;
	name: string;
	display: string;
	color: string | null;
	order: number;
}

export interface ReverseRelationship {
	fieldApiName: string;
	relationship: RelationshipType | null;
}

export interface Field {
	id: number;
	name: string;
	apiName: string;
	display: string;
	type: string;
	typeOptions: Record<string, unknown> | null;
	multiple: boolean;
	unique: boolean;
	options: FieldOption[] | null;
	relationship: RelationshipType | null;
	reverseRelationship: ReverseRelationship | null;
	relationshipDataType: TableWithFields | null;
}

export interface TableWithFields extends Table {
	fields: Field[];
}

export type GetTableResponse = TableWithFields;

// Record Types

export interface FormattedRecord {
	id: number;
	uuid: string;
	createdAt: string;
	updatedAt?: string;
	[key: string]: unknown;
}

export interface PageInfo {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	startCursor?: string;
	endCursor?: string;
}

export interface GetRecordsResponse {
	totalCount: number;
	records: FormattedRecord[];
	pageInfo: PageInfo;
}

export type GetRecordResponse = FormattedRecord;

export type CreateRecordResponse = FormattedRecord | null;

export type UpdateRecordResponse = FormattedRecord | null;

export type DeleteRecordResponse = FormattedRecord | null;

// Filter Types

export type FilterName =
	| 'equals'
	| 'contains'
	| 'in'
	| 'notIn'
	| 'gt'
	| 'gte'
	| 'lt'
	| 'lte';

export type OperatorFilterName = 'not' | 'and' | 'or' | 'some' | 'none' | 'every';

export type ValueFilter = Partial<Record<FilterName, unknown>>;

export type OperatorFilter = Partial<Record<OperatorFilterName, ValueFilter>>;

export type FilterSchema = Record<string, ValueFilter | OperatorFilter>;

// Relationship Types

export type RelationshipType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';

// Data Source Types

export type DataSourceType =
	| 'INTERNAL'
	| 'AIRTABLE'
	| 'API'
	| 'GOOGLE_SHEETS'
	| 'HUBSPOT'
	| 'MYSQL'
	| 'POSTGRES'
	| 'SMART_SUITE'
	| 'STRIPE'
	| 'XANO';

// Data Types

export type NolocoDataType =
	| 'TEXT'
	| 'DATE'
	| 'INTEGER'
	| 'DECIMAL'
	| 'DURATION'
	| 'BOOLEAN'
	| 'RICH_TEXT'
	| 'SINGLE_OPTION'
	| 'MULTIPLE_OPTION'
	| 'OBJECT';

// Request Types

export interface GetRecordsParams {
	sortBy?: 'createdAt' | 'updatedAt';
	orderBy?: 'ASC' | 'DESC';
	after?: string;
	before?: string;
	first?: number;
	filter?: FilterSchema;
	include?: string[];
}

export interface GetRecordParams {
	include?: string[];
}

export interface CreateRecordParams {
	include?: string[];
}

export interface FileInput {
	url: string;
	filename?: string;
}

export type RecordInput = Record<string, unknown>;

