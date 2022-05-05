import { BenchmarkRunner } from 'pip-benchmark-node';
import { ConsoleEventPrinter } from 'pip-benchmark-node';
import { MeasurementType } from 'pip-benchmark-node';
import { ExecutionType } from 'pip-benchmark-node';
import { StatisticsBenchmarkSuite } from './StatisticsBenchmarkSuite';

let runner = new BenchmarkRunner();

ConsoleEventPrinter.attach(runner);

runner.benchmarks.addSuite(new StatisticsBenchmarkSuite);

runner.parameters.set({
    'Statistics.InitialRecordNumber': 0,
    'Statistics.CounterNumber': 10,
    'Statistics.IterationNumber': 100,
    'Statistics.MongoUri': process.env['MONGO_URI'],
    'Statistics.MongoHost': process.env['MONGO_HOST'] || 'localhost',
    'Statistics.MongoPort': process.env['MONGO_PORT'] || 27017,
    'Statistics.MongoDb': process.env['MONGO_DB'] || 'benchmark'
});

runner.configuration.measurementType = MeasurementType.Peak;
runner.configuration.executionType = ExecutionType.Sequential;
runner.configuration.duration = 10 * 24 * 3600;

runner.benchmarks.selectByName(['Statistics.IncrementMongoDbStatistics']);

runner.run((err: any) => {
    if (err) console.error(err);
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
