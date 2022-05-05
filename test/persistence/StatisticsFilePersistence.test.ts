import { StatisticsFilePersistence } from '../../src/persistence/StatisticsFilePersistence';
import { StatisticsPersistenceFixture } from './StatisticsPersistenceFixture';

suite('StatisticsFilePersistence', ()=> {
    let persistence: StatisticsFilePersistence;
    let fixture: StatisticsPersistenceFixture;
    
    setup(async () => {
        persistence = new StatisticsFilePersistence('./data/statistics.test.json');

        fixture = new StatisticsPersistenceFixture(persistence);
        
        await persistence.open(null);
        await persistence.clear(null);
    });
    
    teardown(async () => {
        await persistence.close(null);
    });
        
    test('CRUD Operations', async () => {
        await fixture.testCrudOperations();
    });
});