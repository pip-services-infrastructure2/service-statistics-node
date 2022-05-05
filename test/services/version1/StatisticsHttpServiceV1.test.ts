const restify = require('restify');
const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';
import { DateTimeConverter } from 'pip-services3-commons-nodex';

import { StatCounterV1 } from '../../../src/data/version1/StatCounterV1';
import { StatCounterTypeV1 } from '../../../src/data/version1/StatCounterTypeV1';
import { StatisticsMemoryPersistence } from '../../../src/persistence/StatisticsMemoryPersistence';
import { StatisticsController } from '../../../src/logic/StatisticsController';
import { StatisticsHttpServiceV1 } from '../../../src/services/version1/StatisticsHttpServiceV1';

let httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);


suite('StatisticsHttpServiceV1', ()=> {
    let service: StatisticsHttpServiceV1;

    let rest: any;

    suiteSetup(async () => {
        let persistence = new StatisticsMemoryPersistence();
        let controller = new StatisticsController();

        service = new StatisticsHttpServiceV1();
        service.configure(httpConfig);

        let references: References = References.fromTuples(
            new Descriptor('service-statistics', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('service-statistics', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('service-statistics', 'service', 'http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        await service.open(null);
    });
    
    suiteTeardown(async () => {
        await service.close(null);
    });

    setup(() => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });
    });
    
    test('CRUD Operations', async () => {
        // Increment counter
        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/statistics/increment_counter',
                {
                    group: 'test',
                    name: 'value1',
                    time: DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'),
                    timezone: 'UTC',
                    value: 1
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        // Increment the same counter again
        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/statistics/increment_counter',
                {
                    group: 'test',
                    name: 'value1',
                    time: DateTimeConverter.toDateTime('1975-04-09T20:00:00.00Z'),
                    timezone: 'UTC',
                    value: 2
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        // Check all counters
        let page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/statistics/get_counters',
                {},
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isObject(page);
        assert.lengthOf(page.data, 1);

        // Check all groups
        page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/statistics/get_groups',
                {},
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isObject(page);
        assert.lengthOf(page.data, 1);

        // Check total counters
        let set = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/statistics/read_one_counter',
                {
                    group: 'test',
                    name: 'value1',
                    type: StatCounterTypeV1.Total
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isObject(set);
        assert.lengthOf(set.values, 1);

        let record = set.values[0];
        assert.equal(3, record.value);

        // Check monthly counters
        let sets = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/statistics/read_counters',
                {
                    counters: [new StatCounterV1('test', 'value1')],
                    type: StatCounterTypeV1.Hour,
                    from_time: DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'),
                    to_time: DateTimeConverter.toDateTime('1975-04-09T19:00:00.00Z'),
                    timezone: 'UTC'
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.lengthOf(sets, 1);

        set = sets[0];
        assert.isObject(set);
        assert.lengthOf(set.values, 1);

        record = set.values[0];
        assert.equal(1, record.value);
    });
});