import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { fetchProjectTableFields, fetchProjectRecords } from '../helpers/transport';
import { nolocoTypeToN8nType } from '../helpers/utils';

/**
 * Get all editable fields from the selected table
 */
export async function getFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const projectName = this.getCurrentNodeParameter('app', { extractValue: true }) as string;
	const dataType = this.getCurrentNodeParameter('dataType', { extractValue: true }) as string;

	if (!projectName || !dataType) {
		return [];
	}

	try {
		const tableSchema = await fetchProjectTableFields.call(this, projectName, dataType);

		// Filter out system fields that shouldn't be edited directly
		const systemFields = ['id', 'uuid', 'createdAt', 'updatedAt'];

		const options: INodePropertyOptions[] = tableSchema.fields
			.filter((field) => !systemFields.includes(field.apiName))
			.filter((field) => {
				// Include fields that have a mappable type or are relationships
				return nolocoTypeToN8nType(field.type) !== undefined || field.relationship !== null;
			})
			.map((field) => {
				let description = field.type;
				if (field.relationship) {
					description = `Relationship (${field.relationship}) - use record ID`;
				}
				if (field.options && field.options.length > 0) {
					description = `${field.type} - ${field.options.length} options`;
				}
				if (field.unique) {
					description = `${description} (unique)`;
				}

				return {
					name: field.display,
					value: field.relationship ? `${field.apiName}Id` : field.apiName,
					description,
				};
			});

		return options;
	} catch {
		return [];
	}
}

/**
 * Get all fields including system fields for searching
 */
export async function getSearchableFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const projectName = this.getCurrentNodeParameter('app', { extractValue: true }) as string;
	const dataType = this.getCurrentNodeParameter('dataType', { extractValue: true }) as string;

	if (!projectName || !dataType) {
		return [];
	}

	try {
		const tableSchema = await fetchProjectTableFields.call(this, projectName, dataType);

		const options: INodePropertyOptions[] = tableSchema.fields
			.filter((field) => {
				// Include fields that have a mappable type
				return nolocoTypeToN8nType(field.type) !== undefined;
			})
			.map((field) => {
				let description = field.type;
				if (field.unique) {
					description = `${description} (unique)`;
				}

				return {
					name: field.display,
					value: field.apiName,
					description,
				};
			});

		// Add id field at the beginning for search
		options.unshift({
			name: 'ID',
			value: 'id',
			description: 'Record ID (unique)',
		});

		return options;
	} catch {
		return [];
	}
}

/**
 * Get options for a single/multiple select field
 */
export async function getFieldOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const projectName = this.getCurrentNodeParameter('app', { extractValue: true }) as string;
	const dataType = this.getCurrentNodeParameter('dataType', { extractValue: true }) as string;
	const fieldName = this.getCurrentNodeParameter('fieldName', { extractValue: true }) as string;

	if (!projectName || !dataType || !fieldName) {
		return [];
	}

	try {
		const tableSchema = await fetchProjectTableFields.call(this, projectName, dataType);

		// Find the field (remove Id suffix if it's a relationship field reference)
		const cleanFieldName = fieldName.endsWith('Id') ? fieldName.slice(0, -2) : fieldName;
		const field = tableSchema.fields.find(
			(f) => f.apiName === cleanFieldName || f.apiName === fieldName,
		);

		if (!field || !field.options || field.options.length === 0) {
			return [];
		}

		return field.options.map((option) => ({
			name: option.display,
			value: option.name,
			description: option.color ? `Color: ${option.color}` : undefined,
		}));
	} catch {
		return [];
	}
}

/**
 * Get records from related table for relationship fields
 */
export async function getRelatedRecords(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const projectName = this.getCurrentNodeParameter('app', { extractValue: true }) as string;
	const dataType = this.getCurrentNodeParameter('dataType', { extractValue: true }) as string;
	const fieldName = this.getCurrentNodeParameter('fieldName', { extractValue: true }) as string;

	if (!projectName || !dataType || !fieldName) {
		return [];
	}

	try {
		const tableSchema = await fetchProjectTableFields.call(this, projectName, dataType);

		// Find the field and check if it's a relationship
		const cleanFieldName = fieldName.endsWith('Id') ? fieldName.slice(0, -2) : fieldName;
		const field = tableSchema.fields.find((f) => f.apiName === cleanFieldName);

		if (!field || !field.relationship || !field.relationshipDataType) {
			return [];
		}

		const relatedRecords = await fetchProjectRecords.call(
			this,
			projectName,
			field.relationshipDataType.apiName,
			{ first: 100 },
		);

		return relatedRecords.records.map((record) => {
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
	} catch {
		return [];
	}
}

