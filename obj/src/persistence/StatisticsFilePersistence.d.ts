import { ConfigParams } from 'pip-services3-commons-nodex';
import { JsonFilePersister } from 'pip-services3-data-nodex';
import { StatisticsMemoryPersistence } from './StatisticsMemoryPersistence';
import { StatCounterRecordV1 } from '../data/version1/StatCounterRecordV1';
export declare class StatisticsFilePersistence extends StatisticsMemoryPersistence {
    protected _persister: JsonFilePersister<StatCounterRecordV1>;
    constructor(path?: string);
    configure(config: ConfigParams): void;
}
