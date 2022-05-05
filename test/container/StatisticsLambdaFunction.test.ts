const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { DateTimeConverter } from 'pip-services3-commons-nodex';

import { StatCounterV1 } from '../../src/data/version1/StatCounterV1';
import { StatCounterValueSetV1 } from '../../src/data/version1/StatCounterValueSetV1';
import { StatCounterTypeV1 } from '../../src/data/version1/StatCounterTypeV1';
import { StatisticsMemoryPersistence } from '../../src/persistence/StatisticsMemoryPersistence';
import { StatisticsController } from '../../src/logic/StatisticsController';
import { StatisticsLambdaFunction } from '../../src/container/StatisticsLambdaFunction';


suite('StatisticsLambdaFunction', ()=> {
    let lambda: StatisticsLambdaFunction;

    suiteSetup(async () => {
        let config = ConfigParams.fromTuples(
            'logger.descriptor', 'pip-services:logger:console:default:1.0',
            'persistence.descriptor', 'service-statistics:persistence:memory:default:1.0',
            'controller.descriptor', 'service-statistics:controller:default:default:1.0'
        );

        lambda = new StatisticsLambdaFunction();
        lambda.configure(config);
        await lambda.open(null);
    });
    
    suiteTeardown(async () => {
        await lambda.close(null);
    });
    
    test('CRUD Operations', async () => {
        // Increment counter
        await lambda.act(
            {
                role: 'statistics',
                cmd: 'increment_counter',
                group: 'test',
                name: 'value1',
                time: DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'),
                value: 1
            }
        );

        // Increment the same counter again
        lambda.act(
            {
                role: 'statistics',
                cmd: 'increment_counter',
                group: 'test',
                name: 'value1',
                time: DateTimeConverter.toDateTime('1975-04-09T20:00:00.00Z'),
                value: 2
            }
        );
        
        // Check all counters
        let page = await lambda.act(
            {
                role: 'statistics',
                cmd: 'get_counters',
            }
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 1);

        // Check all groups
        page = await lambda.act(
            {
                role: 'statistics',
                cmd: 'get_groups',
            }
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 1);

        // Check total counters
        let set = await lambda.act(
            {
                role: 'statistics',
                cmd: 'read_one_counter',
                group: 'test',
                name: 'value1',
                type: StatCounterTypeV1.Total
            }
        );

        assert.isObject(set);
        assert.lengthOf(set.values, 1);

        let record = set.values[0];
        assert.equal(3, record.value);

        // Check monthly counters
        let sets = await lambda.act(
            {
                role: 'statistics',
                cmd: 'read_counters',
                counters: [new StatCounterV1('test', 'value1')],
                type: StatCounterTypeV1.Hour,
                from_time: DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'),
                to_time: DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'),
            }
        );

        assert.lengthOf(sets, 1);

        set = sets[0];
        assert.isObject(set);
        assert.lengthOf(set.values, 1);

        record = set.values[0];
        assert.equal(1, record.value);
    });
});