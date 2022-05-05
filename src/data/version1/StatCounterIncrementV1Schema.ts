import { ObjectSchema } from 'pip-services3-commons-nodex';
import { TypeCode } from 'pip-services3-commons-nodex';

export class StatCounterIncrementV1Schema extends ObjectSchema {
    public constructor() {
        super();
        this.withRequiredProperty('group', TypeCode.String);
        this.withRequiredProperty('name', TypeCode.String);
        this.withOptionalProperty('time', TypeCode.DateTime);
        this.withOptionalProperty('timezone', TypeCode.String);
        this.withRequiredProperty('value', TypeCode.Float);
    }
}