const assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DateTimeConverter } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';
import { ConsoleLogger } from 'pip-services3-components-nodex';

import { StatCounterV1 } from '../../src/data/version1/StatCounterV1';
import { StatCounterIncrementV1 } from '../../src/data/version1/StatCounterIncrementV1';
import { StatCounterTypeV1 } from '../../src/data/version1/StatCounterTypeV1';
import { StatisticsMemoryPersistence } from '../../src/persistence/StatisticsMemoryPersistence';
import { StatisticsController } from '../../src/logic/StatisticsController';

suite('StatisticsController', ()=> {
    let persistence: StatisticsMemoryPersistence;
    let controller: StatisticsController;

    suiteSetup(() => {
        persistence = new StatisticsMemoryPersistence();
        controller = new StatisticsController();

        let logger = new ConsoleLogger();

        let references: References = References.fromTuples(
            new Descriptor('pip-services', 'logger', 'console', 'default', '1.0'), logger,
            new Descriptor('service-statistics', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('service-statistics', 'controller', 'default', 'default', '1.0'), controller
        );

        controller.setReferences(references);
    });
    
    setup(async () => {
        await persistence.clear(null);
    });
    
    test('CRUD Operations', async () => {
        // Increment counter
        await controller.incrementCounter(null, 'test', 'value1', DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'), 'UTC', 1);

        // Increment the same counter again
        await controller.incrementCounters(
            null,
            [
                <StatCounterIncrementV1>{
                    group: 'test',
                    name: 'value1',
                    time: DateTimeConverter.toDateTime('1975-04-09T20:00:00.00Z'),
                    timezone: 'UTC',
                    value: 2
                }
            ]
        );

        // Check all counters
        let page = await controller.getCounters(null, null, new PagingParams());

        assert.isObject(page);
        assert.lengthOf(page.data, 1);
        
        // Check all counters
        let groupsPage = await controller.getGroups(null, new PagingParams());

        assert.isObject(groupsPage);
        assert.lengthOf(groupsPage.data, 1);

        // Check total counters
        let set = await controller.readOneCounter(null, 'test', 'value1', StatCounterTypeV1.Total, null, null, null);

        assert.isObject(set);
        assert.lengthOf(set.values, 1);

        let record = set.values[0];
        assert.equal(3, record.value);

        // Check total counters by group
        let sets = await controller.readCountersByGroup(null, 'test', StatCounterTypeV1.Total, null, null, null);

        assert.isArray(sets);
        assert.lengthOf(sets, 1);

        set = sets[0];
        assert.lengthOf(set.values, 1);

        record = set.values[0];
        assert.equal(3, record.value);

        // Check monthly counters
        sets = await controller.readCounters(
            null,
            [new StatCounterV1('test', 'value1')],
            StatCounterTypeV1.Hour,
            DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'),
            DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'),
            'UTC'
        );

        assert.lengthOf(sets, 1);

        set = sets[0];
        assert.isObject(set);
        assert.lengthOf(set.values, 1);

        record = set.values[0];
        assert.equal(1, record.value);
    });
});