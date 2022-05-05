import { ProcessContainer } from 'pip-services3-container-nodex';

import { StatisticsServiceFactory } from '../build/StatisticsServiceFactory';
import { DefaultRpcFactory } from 'pip-services3-rpc-nodex';
import { DefaultSwaggerFactory } from 'pip-services3-swagger-nodex';

export class StatisticsProcess extends ProcessContainer {

    public constructor() {
        super("statistics", "Statistics microservice");
        this._factories.add(new StatisticsServiceFactory);
        this._factories.add(new DefaultRpcFactory);
        this._factories.add(new DefaultSwaggerFactory);
    }


}
