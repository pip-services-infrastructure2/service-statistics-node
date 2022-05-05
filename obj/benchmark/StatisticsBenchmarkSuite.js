"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsBenchmarkSuite = void 0;
const pip_benchmark_node_1 = require("pip-benchmark-node");
const pip_benchmark_node_2 = require("pip-benchmark-node");
const IncrementMongoDbStatisticsBenchmark_1 = require("./IncrementMongoDbStatisticsBenchmark");
class StatisticsBenchmarkSuite extends pip_benchmark_node_1.BenchmarkSuite {
    constructor() {
        super("Statistics", "Statistics benchmark");
        this.addParameter(new pip_benchmark_node_2.Parameter('InitialRecordNumber', 'Number of records at start', '0'));
        this.addParameter(new pip_benchmark_node_2.Parameter('CounterNumber', 'Number of counters', '10'));
        this.addParameter(new pip_benchmark_node_2.Parameter('IterationNumber', 'Number of iterations', '10'));
        this.addParameter(new pip_benchmark_node_2.Parameter('MongoUri', 'MongoDB URI', null));
        this.addParameter(new pip_benchmark_node_2.Parameter('MongoHost', 'MongoDB Hostname', 'localhost'));
        this.addParameter(new pip_benchmark_node_2.Parameter('MongoPort', 'MongoDB Port', '27017'));
        this.addParameter(new pip_benchmark_node_2.Parameter('MongoDb', 'MongoDB Database', 'benchmark'));
        this.addBenchmark(new IncrementMongoDbStatisticsBenchmark_1.IncrementMongoDbStatisticsBenchmark());
    }
}
exports.StatisticsBenchmarkSuite = StatisticsBenchmarkSuite;
//# sourceMappingURL=StatisticsBenchmarkSuite.js.map