import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { StatCounterRecordV1 } from '../data/version1/StatCounterRecordV1';
import { StatCounterIncrementV1 } from '../data/version1/StatCounterIncrementV1';
export interface IStatisticsPersistence {
    getGroups(correlationId: string, paging: PagingParams): Promise<DataPage<string>>;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<StatCounterRecordV1>>;
    getListByFilter(correlationId: string, filter: FilterParams): Promise<StatCounterRecordV1[]>;
    incrementOne(correlationId: string, group: string, name: string, time: Date, timezone: string, value: number): Promise<void>;
    incrementBatch(correlationId: string, increments: StatCounterIncrementV1[]): Promise<void>;
}
