"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsHttpServiceV1 = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
class StatisticsHttpServiceV1 extends pip_services3_rpc_nodex_1.CommandableHttpService {
    constructor() {
        super('v1/statistics');
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-statistics', 'controller', 'default', '*', '1.0'));
    }
}
exports.StatisticsHttpServiceV1 = StatisticsHttpServiceV1;
//# sourceMappingURL=StatisticsHttpServiceV1.js.map