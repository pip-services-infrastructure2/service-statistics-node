let moment = require('moment-timezone');

import { StatCounterTypeV1 } from '../data/version1/StatCounterTypeV1';

export class StatCounterKeyGenerator {

    private static makeCounterTime(type: StatCounterTypeV1, momentTime: any): number {
        let result = 0;

        if (type != StatCounterTypeV1.Total) {
            result = momentTime.year();

            if (type != StatCounterTypeV1.Year) {
                result = result * 100 + momentTime.month() + 1;
                if (type != StatCounterTypeV1.Month) {
                    result = result * 100 + momentTime.date();
                    if (type != StatCounterTypeV1.Day) {
                        result = result * 100 + momentTime.hour();

                        // Account for 1 hour ahead
                        if (momentTime.minute() > 0 || momentTime.second() > 0)
                            result += 1;
                    }
                }
            }
        }

        return result;
    }

    public static makeCounterKeyFromMoment(group: string, name: string, type: StatCounterTypeV1,
        momentTime: any): string {
        let key = '' + group + '_' + name;
        if (type != StatCounterTypeV1.Total) 
            key = key + '_' + StatCounterKeyGenerator.makeCounterTime(type, momentTime);
        return key;
    }

    public static makeCounterKeyFromTime(group: string, name: string, type: StatCounterTypeV1,
        time: Date, timezone: string): string {

        let tz = timezone || 'UTC';
        let momentTime =  moment(time).tz(tz);
            
        return StatCounterKeyGenerator.makeCounterKeyFromMoment(group, name, type, momentTime);
    }
    
}