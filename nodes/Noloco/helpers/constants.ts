// Data Types
export const TEXT = 'TEXT';
export const DATE = 'DATE';
export const INTEGER = 'INTEGER';
export const DECIMAL = 'DECIMAL';
export const DURATION = 'DURATION';
export const BOOLEAN = 'BOOLEAN';
export const RICH_TEXT = 'RICH_TEXT';
export const SINGLE_OPTION = 'SINGLE_OPTION';
export const MULTIPLE_OPTION = 'MULTIPLE_OPTION';
export const OBJECT = 'OBJECT';

export const DATA_TYPES = [
	TEXT,
	DATE,
	INTEGER,
	DECIMAL,
	DURATION,
	BOOLEAN,
	RICH_TEXT,
	SINGLE_OPTION,
	MULTIPLE_OPTION,
	OBJECT,
] as const;

// Filters
export const EQUAL = 'equals';
export const CONTAINS = 'contains';
export const IN = 'in';
export const NOT_IN = 'notIn';
export const GREATER = 'gt';
export const GREATER_OR_EQUAL = 'gte';
export const LESS = 'lt';
export const LESS_OR_EQUAL = 'lte';
export const NOT = 'not';
export const AND = 'and';
export const OR = 'or';
export const SOME = 'some';
export const NONE = 'none';
export const EVERY = 'every';

export const FILTER_NAMES = [
	EQUAL,
	IN,
	NOT_IN,
	CONTAINS,
	GREATER,
	GREATER_OR_EQUAL,
	LESS,
	LESS_OR_EQUAL,
] as const;

export const OPERATOR_FILTER_NAMES = [NOT, AND, OR, SOME, NONE, EVERY] as const;

// Relationships
export const ONE_TO_ONE = 'ONE_TO_ONE';
export const ONE_TO_MANY = 'ONE_TO_MANY';
export const MANY_TO_ONE = 'MANY_TO_ONE';
export const MANY_TO_MANY = 'MANY_TO_MANY';

export const RELATIONSHIPS = [ONE_TO_ONE, MANY_TO_ONE, ONE_TO_MANY, MANY_TO_MANY] as const;

// Data Sources
export const INTERNAL = 'INTERNAL';
export const AIRTABLE = 'AIRTABLE';
export const API = 'API';
export const GOOGLE_SHEETS = 'GOOGLE_SHEETS';
export const HUBSPOT = 'HUBSPOT';
export const MYSQL = 'MYSQL';
export const POSTGRES = 'POSTGRES';
export const SMART_SUITE = 'SMART_SUITE';
export const STRIPE = 'STRIPE';
export const XANO = 'XANO';

export const DATA_SOURCES = [
	INTERNAL,
	AIRTABLE,
	API,
	GOOGLE_SHEETS,
	HUBSPOT,
	MYSQL,
	POSTGRES,
	SMART_SUITE,
	STRIPE,
	XANO,
] as const;

// API Configuration
export const BASE_API_URL = 'https://api.portals.noloco.io';
export const GRAPHQL_FORMAT = 'graphql';

