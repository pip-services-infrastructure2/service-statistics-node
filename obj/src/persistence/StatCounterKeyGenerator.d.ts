import { StatCounterTypeV1 } from '../data/version1/StatCounterTypeV1';
export declare class StatCounterKeyGenerator {
    private static makeCounterTime;
    static makeCounterKeyFromMoment(group: string, name: string, type: StatCounterTypeV1, momentTime: any): string;
    static makeCounterKeyFromTime(group: string, name: string, type: StatCounterTypeV1, time: Date, timezone: string): string;
}
