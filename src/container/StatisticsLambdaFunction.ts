import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableLambdaFunction } from 'pip-services3-aws-nodex';

import { StatisticsServiceFactory } from '../build/StatisticsServiceFactory';

export class StatisticsLambdaFunction extends CommandableLambdaFunction {
    public constructor() {
        super("statistics", "Statistics function");
        this._dependencyResolver.put('controller', new Descriptor('service-statistics', 'controller', 'default', '*', '*'));
        this._factories.add(new StatisticsServiceFactory());
    }
}

export const handler = new StatisticsLambdaFunction().getHandler();