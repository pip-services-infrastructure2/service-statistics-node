import { StatCounterValueV1 } from './StatCounterValueV1';
import { StatCounterTypeV1 } from './StatCounterTypeV1';

export class StatCounterValueSetV1 {
    
    public constructor(group: string, name: string, type: StatCounterTypeV1, values: StatCounterValueV1[]) {
        this.group = group;
        this.name = name;
        this.type = type;
        this.values= values || [];
    }

    public group: string;
    public name: string;
    public type: StatCounterTypeV1;
    public values: StatCounterValueV1[];
}