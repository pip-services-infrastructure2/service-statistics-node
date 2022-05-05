"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsProcess = void 0;
const pip_services3_container_nodex_1 = require("pip-services3-container-nodex");
const StatisticsServiceFactory_1 = require("../build/StatisticsServiceFactory");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
const pip_services3_swagger_nodex_1 = require("pip-services3-swagger-nodex");
class StatisticsProcess extends pip_services3_container_nodex_1.ProcessContainer {
    constructor() {
        super("statistics", "Statistics microservice");
        this._factories.add(new StatisticsServiceFactory_1.StatisticsServiceFactory);
        this._factories.add(new pip_services3_rpc_nodex_1.DefaultRpcFactory);
        this._factories.add(new pip_services3_swagger_nodex_1.DefaultSwaggerFactory);
    }
}
exports.StatisticsProcess = StatisticsProcess;
//# sourceMappingURL=StatisticsProcess.js.map