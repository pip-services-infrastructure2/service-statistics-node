import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableHttpService } from 'pip-services3-rpc-nodex';

export class StatisticsCommandableHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/statistics');
        this._dependencyResolver.put('controller', new Descriptor('service-statistics', 'controller', 'default', '*', '1.0'));
    }
}