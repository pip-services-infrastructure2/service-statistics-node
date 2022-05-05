import { BenchmarkSuite } from 'pip-benchmark-node';
import { Parameter } from 'pip-benchmark-node';

import { IncrementMongoDbStatisticsBenchmark } from './IncrementMongoDbStatisticsBenchmark';

export class StatisticsBenchmarkSuite extends BenchmarkSuite {

    public constructor() {
        super("Statistics", "Statistics benchmark");

        this.addParameter(new Parameter('InitialRecordNumber', 'Number of records at start', '0'));
        this.addParameter(new Parameter('CounterNumber', 'Number of counters', '10'));
        this.addParameter(new Parameter('IterationNumber', 'Number of iterations', '10'));
        
        this.addParameter(new Parameter('MongoUri', 'MongoDB URI', null));
        this.addParameter(new Parameter('MongoHost', 'MongoDB Hostname', 'localhost'));
        this.addParameter(new Parameter('MongoPort', 'MongoDB Port', '27017'));
        this.addParameter(new Parameter('MongoDb', 'MongoDB Database', 'benchmark'));
        
        this.addBenchmark(new IncrementMongoDbStatisticsBenchmark());
    }

}