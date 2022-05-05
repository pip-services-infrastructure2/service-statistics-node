import { Benchmark } from 'pip-benchmark-node';
export declare class IncrementMongoDbStatisticsBenchmark extends Benchmark {
    private _initialRecordNumber;
    private _counterNumber;
    private _iterationNumber;
    private _persistence;
    private _controller;
    constructor();
    setUp(): Promise<void>;
    tearDown(): Promise<void>;
    private getRandomCounter;
    execute(): Promise<void>;
}
