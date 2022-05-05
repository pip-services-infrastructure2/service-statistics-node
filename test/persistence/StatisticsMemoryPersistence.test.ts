import { StatisticsMemoryPersistence } from '../../src/persistence/StatisticsMemoryPersistence';
import { StatisticsPersistenceFixture } from './StatisticsPersistenceFixture';

suite('StatisticsMemoryPersistence', ()=> {
    let persistence: StatisticsMemoryPersistence;
    let fixture: StatisticsPersistenceFixture;
    
    setup(async () => {
        persistence = new StatisticsMemoryPersistence();
        fixture = new StatisticsPersistenceFixture(persistence);
        
        await persistence.open(null);
    });
    
    teardown(async () => {
        await persistence.close(null);
    });
        
    test('CRUD Operations', async () => {
        await fixture.testCrudOperations();
    });

});