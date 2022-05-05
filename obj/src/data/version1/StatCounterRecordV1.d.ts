import { IStringIdentifiable } from 'pip-services3-commons-nodex';
import { StatCounterTypeV1 } from './StatCounterTypeV1';
export declare class StatCounterRecordV1 implements IStringIdentifiable {
    id: string;
    group: string;
    name: string;
    type: StatCounterTypeV1;
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    value: number;
}
