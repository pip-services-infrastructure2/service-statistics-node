import { ConfigParams } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { DependencyResolver } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { ICommandable } from 'pip-services3-commons-nodex';
import { CommandSet } from 'pip-services3-commons-nodex';
import { DateTimeConverter } from 'pip-services3-commons-nodex';

import { StatCounterTypeV1 } from '../data/version1/StatCounterTypeV1';
import { StatCounterV1 } from '../data/version1/StatCounterV1';
import { StatCounterIncrementV1 } from '../data/version1/StatCounterIncrementV1';
import { StatCounterValueV1 } from '../data/version1/StatCounterValueV1';
import { StatCounterValueSetV1 } from '../data/version1/StatCounterValueSetV1';
import { IStatisticsPersistence } from '../persistence/IStatisticsPersistence';
import { IStatisticsController } from './IStatisticsController';
import { StatisticsCommandSet } from './StatisticsCommandSet';

export class StatisticsController implements IConfigurable, IReferenceable, ICommandable, IStatisticsController {
    private static _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        'dependencies.persistence', 'service-statistics:persistence:*:*:1.0',

        'options.facets_group', 'statistics'
    );

    private _dependencyResolver: DependencyResolver = new DependencyResolver(StatisticsController._defaultConfig);
    private _persistence: IStatisticsPersistence;
    private _commandSet: StatisticsCommandSet;
    private _facetsGroup: string = 'statistics';

    public configure(config: ConfigParams): void {
        this._dependencyResolver.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired<IStatisticsPersistence>('persistence');
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null)
            this._commandSet = new StatisticsCommandSet(this);
        return this._commandSet;
    }

    public async getGroups(correlationId: string, paging: PagingParams): Promise<DataPage<string>> {
        return await this._persistence.getGroups(correlationId, paging);
    }

    public async getCounters(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<StatCounterV1>> {
        filter = filter || new FilterParams();
        filter.setAsObject('type', StatCounterTypeV1.Total);
        let page = await this._persistence.getPageByFilter(correlationId, filter, paging);

        let counters = page.data.map((x) => new StatCounterV1(x.group, x.name));
        return new DataPage<StatCounterV1>(counters, page.total);
    }

    public async incrementCounter(correlationId: string, group: string, name: string,
        time: Date, timezone: string, value: number): Promise<void> {

        time = DateTimeConverter.toDateTimeWithDefault(time, new Date());
        timezone = timezone || 'UTC';

        return await this._persistence.incrementOne(correlationId, group, name, time, timezone, value);
    }

    public async incrementCounters(correlationId: string, increments: StatCounterIncrementV1[]): Promise<void> {

        let tempIncrements: StatCounterIncrementV1[] = [];

        for (let increment of increments) {
            // Fix increments
            increment.time = DateTimeConverter.toDateTimeWithDefault(increment.time, new Date());
            let roundedToHours = Math.trunc((increment.time.getTime() + 3599999) / 3600000) * 3600000;
            increment.time = new Date(roundedToHours);
            increment.timezone = increment.timezone || 'UTC';

            // Find similar increment
            let tempIncrement = tempIncrements.find((inc) => {
                return inc.group == increment.group
                    && inc.name == increment.name
                    && inc.time.getTime() == increment.time.getTime();
                }
            );
            if (tempIncrement != null)
                tempIncrement.value += increment.value;
            else
                tempIncrements.push(increment);
        }

        await this._persistence.incrementBatch(correlationId, tempIncrements);
    }

    public async readOneCounter(correlationId: string, group: string, name: string, type: StatCounterTypeV1,
        fromTime: Date, toTime: Date, timezone: string): Promise<StatCounterValueSetV1> {
        let filter: FilterParams = FilterParams.fromTuples(
            'group', group,
            'name', name,
            'type', type,
            'from_time', fromTime,
            'to_time', toTime,
            'timezone', timezone
        );
        let records = await this._persistence.getListByFilter(correlationId, filter);

        let set = new StatCounterValueSetV1(group, name, type, []);

        for(let record of records) {
            set.values.push(
                new StatCounterValueV1(
                    record.year,
                    record.month,
                    record.day,
                    record.hour,
                    record.value
                )
            );
        }

        return set;
    }

    public async readCountersByGroup(correlationId: string, group: string, type: StatCounterTypeV1,
        fromTime: Date, toTime: Date, timezone: string): Promise<StatCounterValueSetV1[]> {
        let filter: FilterParams = FilterParams.fromTuples(
            'group', group,
            'type', type,
            'from_time', fromTime,
            'to_time', toTime,
            'timezone', timezone
        );

        let records = await this._persistence.getListByFilter(correlationId, filter);

        let sets: any = {};
        let values: StatCounterValueSetV1[] = [];

        for(let record of records) {
            let set = sets[record.name];
            if (set == null) {
                set = new StatCounterValueSetV1(record.group, record.name, type, []);
                sets[record.name] = set;
                values.push(set);
            }

            set.values.push(
                new StatCounterValueV1(
                    record.year,
                    record.month,
                    record.day,
                    record.hour,
                    record.value
                )
            );
        }

        return values;
    }

    public async readCounters(correlationId: string, counters: StatCounterV1[], type: StatCounterTypeV1,
        fromTime: Date, toTime: Date, timezone: string): Promise<StatCounterValueSetV1[]> {
        let result: StatCounterValueSetV1[] = [];

        for(let counter of counters) {
            let set = await this.readOneCounter(correlationId, counter.group, counter.name, type, fromTime, toTime, timezone);
            if (set) result.push(set);
        }

        return result;
    }
}
