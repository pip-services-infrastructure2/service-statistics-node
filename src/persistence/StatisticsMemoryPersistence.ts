const moment = require('moment-timezone');

import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMemoryPersistence } from 'pip-services3-data-nodex';

import { StatCounterTypeV1 } from '../data/version1/StatCounterTypeV1';
import { StatCounterV1 } from '../data/version1/StatCounterV1';
import { StatCounterRecordV1 } from '../data/version1/StatCounterRecordV1';
import { StatCounterIncrementV1 } from '../data/version1/StatCounterIncrementV1';
import { IStatisticsPersistence } from './IStatisticsPersistence';
import { StatCounterKeyGenerator } from './StatCounterKeyGenerator';

export class StatisticsMemoryPersistence extends IdentifiableMemoryPersistence<StatCounterRecordV1, string>
    implements IStatisticsPersistence {

    constructor() {
        super();
        this._maxPageSize = 1000;
    }

    public async getGroups(correlationId: string, paging: PagingParams): Promise<DataPage<string>> {
        let items = this._items.map((item) => item.group);
        items = [...new Set(items)].sort();

        // Extract a page
        paging = paging != null ? paging : new PagingParams();
        let skip = paging.getSkip(-1);
        let take = paging.getTake(this._maxPageSize);

        let total = null;
        if (paging.total)
            total = items.length;
        
        if (skip > 0)
            items = items.slice(skip);
        items = items.slice(0, take);
                
        let page = new DataPage<string>(items, total);
        return page
    }

    private matchString(value: string, search: string): boolean {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }

    private matchSearch(item: StatCounterRecordV1, search: string): boolean {
        search = search.toLowerCase();
        if (this.matchString(item.group, search))
            return true;
        if (this.matchString(item.name, search))
            return true;
        return false;
    }
    
    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();
        let search = filter.getAsNullableString('search');
        let group = filter.getAsNullableString('group');
        let name = filter.getAsNullableString('name');
        let type = filter.getAsNullableInteger('type');
        let timezone = filter.getAsNullableString('timezone');
        let fromTime = filter.getAsNullableDateTime('from_time');
        let fromId = fromTime != null ? StatCounterKeyGenerator.makeCounterKeyFromTime(group, name, type, fromTime, timezone) : null;
        let toTime = filter.getAsNullableDateTime('to_time');
        let toId = toTime != null ? StatCounterKeyGenerator.makeCounterKeyFromTime(group, name, type, toTime, timezone) : null;

        return (item: StatCounterRecordV1) => {
            if (search != null && !this.matchSearch(item, search))
                return false;
            if (type != null && type != item.type)
                return false;
            if (group != null && item.group != group)
                return false;
            if (name != null && item.name != name)
                return false;
            if (fromId != null && item.id < fromId)
                return false;
            if (toId != null && item.id > toId)
                return false;
            return true;
        };
    }

    public async getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<StatCounterRecordV1>> {
        return await super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null);
    }

    public async getListByFilter(correlationId: string, filter: FilterParams): Promise<StatCounterRecordV1[]> {
        return await super.getListByFilter(correlationId, this.composeFilter(filter), null, null);
    }

    private incrementPartial(correlationId: string, group: string, name: string, type: StatCounterTypeV1,
        momentTime: any, value: number): StatCounterRecordV1 {
        
        let id = StatCounterKeyGenerator.makeCounterKeyFromMoment(group, name, type, momentTime);

        let item = this._items.find((x) => { return x.id == id; });
        if (item != null) {
            item.value += value;
        } else {
            item = {
                id: id,
                group: group,
                name: name,
                type: type,
                value: value
            };
            
            if (type != StatCounterTypeV1.Total) {
                item.year = momentTime.year();
                if (type != StatCounterTypeV1.Year) {
                    item.month = momentTime.month() + 1;
                    if (type != StatCounterTypeV1.Month) {
                        item.day = momentTime.date() + 1;
                        if (type != StatCounterTypeV1.Day) {
                            item.hour = momentTime.hour();
                        }
                    }
                }
            }

            this._items.push(item);
        }

        return item;
    }

    public async incrementOne(correlationId: string, group: string, name: string,
        time: Date, timezone: string, value: number): Promise<void> {
 
        let tz = timezone || 'UTC';
        let momentTime =  moment(time).tz(tz);
                
        this.incrementPartial(correlationId, group, name, StatCounterTypeV1.Total, momentTime, value);
        this.incrementPartial(correlationId, group, name, StatCounterTypeV1.Year, momentTime, value);
        this.incrementPartial(correlationId, group, name, StatCounterTypeV1.Month, momentTime, value);
        this.incrementPartial(correlationId, group, name, StatCounterTypeV1.Day, momentTime, value);
        this.incrementPartial(correlationId, group, name, StatCounterTypeV1.Hour, momentTime, value);

        this._logger.trace(correlationId, "Incremented %s.%s", group, name);

        await this.save(correlationId);    
    }

    public async incrementBatch(correlationId: string, increments: StatCounterIncrementV1[]): Promise<void> {
        for (let inc of increments)
            await this.incrementOne(correlationId, inc.group, inc.name, inc.time, inc.timezone, inc.value);
    }
    
}
