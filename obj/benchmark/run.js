"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_benchmark_node_1 = require("pip-benchmark-node");
const pip_benchmark_node_2 = require("pip-benchmark-node");
const pip_benchmark_node_3 = require("pip-benchmark-node");
const pip_benchmark_node_4 = require("pip-benchmark-node");
const StatisticsBenchmarkSuite_1 = require("./StatisticsBenchmarkSuite");
let runner = new pip_benchmark_node_1.BenchmarkRunner();
pip_benchmark_node_2.ConsoleEventPrinter.attach(runner);
runner.benchmarks.addSuite(new StatisticsBenchmarkSuite_1.StatisticsBenchmarkSuite);
runner.parameters.set({
    'Statistics.InitialRecordNumber': 0,
    'Statistics.CounterNumber': 10,
    'Statistics.IterationNumber': 100,
    'Statistics.MongoUri': process.env['MONGO_URI'],
    'Statistics.MongoHost': process.env['MONGO_HOST'] || 'localhost',
    'Statistics.MongoPort': process.env['MONGO_PORT'] || 27017,
    'Statistics.MongoDb': process.env['MONGO_DB'] || 'benchmark'
});
runner.configuration.measurementType = pip_benchmark_node_3.MeasurementType.Peak;
runner.configuration.executionType = pip_benchmark_node_4.ExecutionType.Sequential;
runner.configuration.duration = 10 * 24 * 3600;
runner.benchmarks.selectByName(['Statistics.IncrementMongoDbStatistics']);
runner.run((err) => {
    if (err)
        console.error(err);
});
// Log uncaught exceptions
process.on('uncaughtException', (ex) => {
    console.error(ex);
    console.error("Process is terminated");
    process.exit(1);
});
// Gracefully shutdown
process.on('exit', function () {
    runner.stop();
    //console.log("Goodbye!");
});
//# sourceMappingURL=run.js.map