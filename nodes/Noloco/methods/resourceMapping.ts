import type {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	ResourceMapperFields,
	FieldType,
} from 'n8n-workflow';

import { fetchProjectTableFields } from '../helpers/transport';
import type { Field } from '../helpers/interfaces';
import {
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
} from '../helpers/constants';
import { getSubFieldsForObject } from '../helpers/utils';

/**
 * Map Noloco field type to n8n ResourceMapper field type
 */
function nolocoTypeToResourceMapperType(field: Field): FieldType | undefined {
	const { type, relationship } = field;

	// Relationships are represented by record IDs (numbers)
	if (relationship) {
		return 'number';
	}

	switch (type) {
		case TEXT:
		case RICH_TEXT:
		case DURATION:
			return 'string';
		case INTEGER:
		case DECIMAL:
			return 'number';
		case BOOLEAN:
			return 'boolean';
		case DATE:
			return 'dateTime';
		case SINGLE_OPTION:
		case MULTIPLE_OPTION:
			return 'options';
		case OBJECT:
			return 'object';
		default:
			return 'string';
	}
}

/**
 * Build options array for SINGLE_OPTION/MULTIPLE_OPTION fields
 */
function buildFieldOptions(field: Field): INodePropertyOptions[] | undefined {
	if (!field.options || field.options.length === 0) {
		return undefined;
	}

	return field.options.map((option) => ({
		name: option.display,
		value: option.name,
	}));
}

/**
 * Get mapping columns for the resourceMapper
 * This is called by n8n to dynamically build the field schema
 */
export async function getMappingColumns(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {
	const projectName = this.getNodeParameter('app', 0, { extractValue: true }) as string;
	const dataType = this.getNodeParameter('dataType', 0, { extractValue: true }) as string;

	if (!projectName || !dataType) {
		return { fields: [] };
	}

	try {
		const tableSchema = await fetchProjectTableFields.call(this, projectName, dataType);

		// System fields that should not be editable
		const systemFields = ['id', 'uuid', 'createdAt', 'updatedAt'];

		const fields = tableSchema.fields
			.filter((field) => !systemFields.includes(field.apiName))
			.flatMap((field) => {
				// Handle OBJECT type fields by expanding to sub-fields
				if (field.type === OBJECT && field.typeOptions?.format) {
					const subFields = getSubFieldsForObject(field);
					return subFields.map((subField) => ({
						id: `${field.apiName}__${subField.apiName}`,
						displayName: `${field.display} > ${subField.display}`,
						defaultMatch: false,
						canBeUsedToMatch: false,
						required: false,
						display: true,
						type: nolocoTypeToResourceMapperType(subField as Field),
						options: buildFieldOptions(subField as Field),
					}));
				}

				// For relationship fields, use the Id suffix
				const fieldId = field.relationship ? `${field.apiName}Id` : field.apiName;

				return [
					{
						id: fieldId,
						displayName: field.display,
						defaultMatch: false,
						canBeUsedToMatch: false,
						required: false, // Noloco doesn't expose required info in the API currently
						display: true,
						type: nolocoTypeToResourceMapperType(field),
						options: buildFieldOptions(field),
					},
				];
			});

		return { fields };
	} catch {
		return { fields: [] };
	}
}
