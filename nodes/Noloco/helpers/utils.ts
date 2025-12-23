import type { INodeProperties } from 'n8n-workflow';

import type { RelationshipType, NolocoDataType, Field } from './interfaces';
import {
	TEXT,
	DATE,
	INTEGER,
	DECIMAL,
	DURATION,
	BOOLEAN,
	SINGLE_OPTION,
	MULTIPLE_OPTION,
	ONE_TO_MANY,
	MANY_TO_ONE,
	MANY_TO_MANY,
} from './constants';

// OBJECT type format constants
export const ADDRESS = 'address';
export const COORDINATES = 'coordinates';
export const DATE_RANGE = 'dateRange';
export const DUE_DATE = 'dueDate';
export const FULL_NAME = 'fullName';
export const PHONE_NUMBER = 'phoneNumber';

// Sub-field display name mappings (API doesn't always provide display names)
const SUB_FIELD_DISPLAY_NAMES: Record<string, Record<string, string>> = {
	[ADDRESS]: {
		street: 'Street',
		suiteAptBldg: 'Suite / Apt. / Building',
		city: 'City',
		stateRegion: 'State / Region',
		postalCode: 'Postal Code',
		country: 'Country',
	},
	[COORDINATES]: {
		latitude: 'Latitude',
		longitude: 'Longitude',
	},
	[DATE_RANGE]: {
		from: 'From',
		to: 'To',
	},
	[DUE_DATE]: {
		from: 'Start (optional)',
		to: 'Due',
		overdue: 'Overdue',
		complete: 'Complete',
	},
	[FULL_NAME]: {
		title: 'Title',
		first: 'First Name',
		middle: 'Middle Name',
		last: 'Last Name',
	},
	[PHONE_NUMBER]: {
		country: 'Country',
		number: 'Number',
	},
};

// Type for sub-field config from API typeOptions
interface ApiSubField {
	type?: string;
	typeOptions?: Record<string, unknown>;
	options?: Array<{ name: string; display: string }>;
}

/**
 * Get sub-fields for an OBJECT type field based on its format
 * Extracts sub-field definitions from field.typeOptions.subFields (from API with format=input)
 */
export function getSubFieldsForObject(field: Field): Array<Partial<Field>> {
	const format = field.typeOptions?.format as string;
	const apiSubFields = field.typeOptions?.subFields as Record<string, ApiSubField> | undefined;

	if (!format || !apiSubFields) {
		return [];
	}

	const displayNames = SUB_FIELD_DISPLAY_NAMES[format] || {};

	return Object.entries(apiSubFields).map(([apiName, subField]) => ({
		id: 0,
		name: apiName,
		apiName,
		display: displayNames[apiName] || apiName,
		type: (subField.type as NolocoDataType) || TEXT,
		typeOptions: subField.typeOptions || null,
		multiple: false,
		unique: false,
		options: subField.options
			? subField.options.map((opt, idx) => ({
					id: idx,
					name: opt.name,
					display: opt.display,
					color: null,
					order: idx,
				}))
			: null,
		relationship: null,
		reverseRelationship: null,
		relationshipDataType: null,
	}));
}

/**
 * Maps Noloco field types to n8n field types
 */
export function nolocoTypeToN8nType(
	type: string,
): 'string' | 'number' | 'boolean' | 'dateTime' | undefined {
	switch (type as NolocoDataType) {
		case TEXT:
		case SINGLE_OPTION:
		case MULTIPLE_OPTION:
		case DURATION:
			return 'string';
		case DECIMAL:
			return 'number';
		case INTEGER:
			return 'number';
		case BOOLEAN:
			return 'boolean';
		case DATE:
			return 'dateTime';
		default:
			return undefined;
	}
}

/**
 * Check if a relationship type represents multiple records
 */
export function isMultiRelationship(relationship: RelationshipType | null | undefined): boolean {
	return relationship === ONE_TO_MANY || relationship === MANY_TO_MANY;
}

/**
 * Check if a reverse relationship type represents multiple records
 */
export function isReverseMultiRelationship(
	relationship: RelationshipType | null | undefined,
): boolean {
	return relationship === MANY_TO_ONE || relationship === MANY_TO_MANY;
}

/**
 * Reverse a relationship type
 */
export function reverseRelationship(relationship: RelationshipType): RelationshipType {
	if (relationship === ONE_TO_MANY) {
		return MANY_TO_ONE;
	}
	if (relationship === MANY_TO_ONE) {
		return ONE_TO_MANY;
	}
	return relationship;
}

/**
 * Check if an HTTP status code indicates success
 */
export function isSuccessStatus(status: number): boolean {
	return status >= 200 && status < 300;
}

/**
 * Build a URL with query parameters
 */
export function buildUrl(baseUrl: string, params: Record<string, string | undefined>): string {
	const queryParts: string[] = [];
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
		}
	}
	if (queryParts.length === 0) {
		return baseUrl;
	}
	const separator = baseUrl.includes('?') ? '&' : '?';
	return `${baseUrl}${separator}${queryParts.join('&')}`;
}

/**
 * Apply display options to properties (n8n utility pattern)
 */
export function updateDisplayOptions(
	displayOptions: INodeProperties['displayOptions'],
	properties: INodeProperties[],
): INodeProperties[] {
	return properties.map((property) => {
		const newProperty = { ...property };

		if (displayOptions?.show) {
			newProperty.displayOptions = newProperty.displayOptions || {};
			newProperty.displayOptions.show = {
				...displayOptions.show,
				...newProperty.displayOptions.show,
			};
		}

		if (displayOptions?.hide) {
			newProperty.displayOptions = newProperty.displayOptions || {};
			newProperty.displayOptions.hide = {
				...displayOptions.hide,
				...newProperty.displayOptions.hide,
			};
		}

		return newProperty;
	});
}

