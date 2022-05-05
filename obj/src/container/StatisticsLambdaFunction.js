"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.StatisticsLambdaFunction = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_aws_nodex_1 = require("pip-services3-aws-nodex");
const StatisticsServiceFactory_1 = require("../build/StatisticsServiceFactory");
class StatisticsLambdaFunction extends pip_services3_aws_nodex_1.CommandableLambdaFunction {
    constructor() {
        super("statistics", "Statistics function");
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-statistics', 'controller', 'default', '*', '*'));
        this._factories.add(new StatisticsServiceFactory_1.StatisticsServiceFactory());
    }
}
exports.StatisticsLambdaFunction = StatisticsLambdaFunction;
exports.handler = new StatisticsLambdaFunction().getHandler();
//# sourceMappingURL=StatisticsLambdaFunction.js.map