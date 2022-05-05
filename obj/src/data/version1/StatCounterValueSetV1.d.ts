import { StatCounterValueV1 } from './StatCounterValueV1';
import { StatCounterTypeV1 } from './StatCounterTypeV1';
export declare class StatCounterValueSetV1 {
    constructor(group: string, name: string, type: StatCounterTypeV1, values: StatCounterValueV1[]);
    group: string;
    name: string;
    type: StatCounterTypeV1;
    values: StatCounterValueV1[];
}
