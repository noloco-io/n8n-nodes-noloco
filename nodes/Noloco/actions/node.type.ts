import type { AllEntities, Entity } from 'n8n-workflow';

type NolocoMap = {
	record: 'create' | 'delete' | 'get' | 'getMany' | 'search' | 'update';
};

export type NolocoType = AllEntities<NolocoMap>;

export type NolocoRecordType = Entity<NolocoMap, 'record'>;

