const moment = require('moment-timezone');

import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';

import { StatCounterTypeV1 } from '../data/version1/StatCounterTypeV1';
import { StatCounterRecordV1 } from '../data/version1/StatCounterRecordV1';
import { StatCounterIncrementV1 } from '../data/version1/StatCounterIncrementV1';
import { IStatisticsPersistence } from './IStatisticsPersistence';
import { StatCounterKeyGenerator } from './StatCounterKeyGenerator';
import { resolve } from 'path';
import { rejects } from 'assert';

export class StatisticsMongoDbPersistence 
    extends IdentifiableMongoDbPersistence<StatCounterRecordV1, string> 
    implements IStatisticsPersistence {

    constructor() {
        super('statistics');
        super.ensureIndex({ group: 1 });
        this._maxPageSize = 1000;
    }

    public async getGroups(correlationId: string, paging: PagingParams): Promise<DataPage<string>> {
        
        // Extract a page
        paging = paging != null ? paging : new PagingParams();
        let skip = paging.getSkip(-1);
        let take = paging.getTake(this._maxPageSize);

        let filter = { type: 0 };
        let options = { group: 1 };
        
        let items = await this._collection.find(filter, options).toArray();

        if (items != null) {
            items = items.map((item) => item.group);
            items = [...new Set(items)].sort();

            let total = null;
            if (paging.total)
                total = items.length;

            if (skip > 0)
                items = items.slice(skip);
            items = items.slice(0, take);

            let page = new DataPage<string>(items, total);
            return page;
        }
    }

    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();

        let criteria = [];

        let search = filter.getAsNullableString('search');
        if (search != null) {
            let searchRegex = new RegExp(search, "i");
            let searchCriteria = [];
            searchCriteria.push({ group: { $regex: searchRegex } });
            searchCriteria.push({ name: { $regex: searchRegex } });
            criteria.push({ $or: searchCriteria });
        }

        let group = filter.getAsNullableString('group');
        if (group != null)
            criteria.push({ group: group });

        let name = filter.getAsNullableString('name');
        if (name != null)
            criteria.push({ name: name });

        let type = filter.getAsNullableInteger('type');
        if (type != null)
            criteria.push({ type: type });

        let timezone = filter.getAsNullableString('timezone');
        let fromTime = filter.getAsNullableDateTime('from_time');
        let fromId = fromTime != null ? StatCounterKeyGenerator.makeCounterKeyFromTime(group, name, type, fromTime, timezone) : null;
        if (fromId != null)
            criteria.push({ _id: { $gte: fromId } });

        let toTime = filter.getAsNullableDateTime('to_time');
        let toId = toTime != null ? StatCounterKeyGenerator.makeCounterKeyFromTime(group, name, type, toTime, timezone) : null;
        if (toId != null)
            criteria.push({ _id: { $lte: toId } });

        return criteria.length > 0 ? { $and: criteria } : {};
    }

    public async getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<StatCounterRecordV1>> {
        return await super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null);
    }

    public async getListByFilter(correlationId: string, filter: FilterParams): Promise<StatCounterRecordV1[]> {
        return await super.getListByFilter(correlationId, this.composeFilter(filter), null, null);
    }

    private addPartialIncrement(batch: any, group: string, name: string, type: StatCounterTypeV1,
        momentTime: any, value: number) {
        
        let id = StatCounterKeyGenerator.makeCounterKeyFromMoment(group, name, type, momentTime);

        let data: any = {
            group: group,
            name: name,
            type: type
        };
        
        if (type != StatCounterTypeV1.Total) {
            data.year = momentTime.year();
            if (type != StatCounterTypeV1.Year) {
                data.month = momentTime.month() + 1;
                if (type != StatCounterTypeV1.Month) {
                    data.day = momentTime.date() + 1;
                    if (type != StatCounterTypeV1.Day) {
                        data.hour = momentTime.hour();
                    }
                }
            }
        }

        batch
            .find({
                _id: id
            })
            .upsert()
            .updateOne({
                $set: data,
                $inc: {
                    value: value
                }
            });
    }

    private addOneIncrement(batch: any, group: string, name: string,
        time: Date, timezone: string, value: number): void {

        let tz = timezone || 'UTC';
        let momentTime =  moment(time).tz(tz);

        this.addPartialIncrement(batch, group, name, StatCounterTypeV1.Total, momentTime, value);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1.Year, momentTime, value);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1.Month, momentTime, value);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1.Day, momentTime, value);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1.Hour, momentTime, value);
    }
    
    public async incrementOne(correlationId: string, group: string, name: string,
        time: Date, timezone: string, value: number): Promise<void> {

        let batch = this._collection.initializeUnorderedBulkOp();
        this.addOneIncrement(batch, group, name, time, timezone, value);

        return await new Promise((resolve, reject) => {
            batch.execute((err) => {
                if (err) reject(err);
                this._logger.trace(correlationId, "Incremented %s.%s", group, name);
                resolve(null);
            });
        }); 
        
    }

    public async incrementBatch(correlationId: string, increments: StatCounterIncrementV1[]): Promise<void> {

        if (increments == null || increments.length == 0) {
            return;
        }

        let batch = this._collection.initializeUnorderedBulkOp();

        for (let increment of increments) {
            this.addOneIncrement(batch,
                increment.group, increment.name, increment.time,
                increment.timezone, increment.value);
        }

        await new Promise((resolve, reject) => {
            batch.execute((err) => {
                if (err) reject(err);
                this._logger.trace(correlationId, "Incremented %d counters", increments.length);
                resolve(null);
            });
        });
    }
}
