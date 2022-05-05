const assert = require('chai').assert;

import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DateTimeConverter } from 'pip-services3-commons-nodex';

import { IStatisticsPersistence } from '../../src/persistence/IStatisticsPersistence';
import { StatCounterTypeV1 } from '../../src/data/version1/StatCounterTypeV1';

export class StatisticsPersistenceFixture {
    private _persistence: IStatisticsPersistence;
    
    constructor(persistence) {
        assert.isNotNull(persistence);
        this._persistence = persistence;
    }
                
    public async testCrudOperations() {
        // Increment counter
        await this._persistence.incrementOne(null, 'test', 'value1', DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'), 'UTC', 1);

        // Increment the same counter again
        await this._persistence.incrementBatch(
            null,
            [
                {
                    group: 'test',
                    name: 'value1',
                    time: DateTimeConverter.toDateTime('1975-04-09T20:00:00.00Z'),
                    timezone: 'UTC',
                    value: 2
                }
            ]
        );

        // Check all counters
        let page = await this._persistence.getPageByFilter(null, null, new PagingParams());

        assert.isObject(page);
        assert.lengthOf(page.data, 6);

        // Check groups
        let groupsPage = await this._persistence.getGroups(null, new PagingParams());

        assert.isObject(groupsPage);
        assert.lengthOf(groupsPage.data, 1);

        // Check total counters
        page = await this._persistence.getPageByFilter(
            null,
            FilterParams.fromTuples(
                'group', 'test',
                'name', 'value1',
                'type', StatCounterTypeV1.Total
            ),
            new PagingParams()
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 1);

        let record = page.data[0];
        assert.equal(3, record.value);
    }
}
