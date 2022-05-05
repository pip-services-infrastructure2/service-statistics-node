"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsController = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const StatCounterTypeV1_1 = require("../data/version1/StatCounterTypeV1");
const StatCounterV1_1 = require("../data/version1/StatCounterV1");
const StatCounterValueV1_1 = require("../data/version1/StatCounterValueV1");
const StatCounterValueSetV1_1 = require("../data/version1/StatCounterValueSetV1");
const StatisticsCommandSet_1 = require("./StatisticsCommandSet");
class StatisticsController {
    constructor() {
        this._dependencyResolver = new pip_services3_commons_nodex_2.DependencyResolver(StatisticsController._defaultConfig);
        this._facetsGroup = 'statistics';
    }
    configure(config) {
        this._dependencyResolver.configure(config);
    }
    setReferences(references) {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired('persistence');
    }
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new StatisticsCommandSet_1.StatisticsCommandSet(this);
        return this._commandSet;
    }
    getGroups(correlationId, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._persistence.getGroups(correlationId, paging);
        });
    }
    getCounters(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            filter = filter || new pip_services3_commons_nodex_3.FilterParams();
            filter.setAsObject('type', StatCounterTypeV1_1.StatCounterTypeV1.Total);
            let page = yield this._persistence.getPageByFilter(correlationId, filter, paging);
            let counters = page.data.map((x) => new StatCounterV1_1.StatCounterV1(x.group, x.name));
            return new pip_services3_commons_nodex_4.DataPage(counters, page.total);
        });
    }
    incrementCounter(correlationId, group, name, time, timezone, value) {
        return __awaiter(this, void 0, void 0, function* () {
            time = pip_services3_commons_nodex_5.DateTimeConverter.toDateTimeWithDefault(time, new Date());
            timezone = timezone || 'UTC';
            return yield this._persistence.incrementOne(correlationId, group, name, time, timezone, value);
        });
    }
    incrementCounters(correlationId, increments) {
        return __awaiter(this, void 0, void 0, function* () {
            let tempIncrements = [];
            for (let increment of increments) {
                // Fix increments
                increment.time = pip_services3_commons_nodex_5.DateTimeConverter.toDateTimeWithDefault(increment.time, new Date());
                let roundedToHours = Math.trunc((increment.time.getTime() + 3599999) / 3600000) * 3600000;
                increment.time = new Date(roundedToHours);
                increment.timezone = increment.timezone || 'UTC';
                // Find similar increment
                let tempIncrement = tempIncrements.find((inc) => {
                    return inc.group == increment.group
                        && inc.name == increment.name
                        && inc.time.getTime() == increment.time.getTime();
                });
                if (tempIncrement != null)
                    tempIncrement.value += increment.value;
                else
                    tempIncrements.push(increment);
            }
            yield this._persistence.incrementBatch(correlationId, tempIncrements);
        });
    }
    readOneCounter(correlationId, group, name, type, fromTime, toTime, timezone) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = pip_services3_commons_nodex_3.FilterParams.fromTuples('group', group, 'name', name, 'type', type, 'from_time', fromTime, 'to_time', toTime, 'timezone', timezone);
            let records = yield this._persistence.getListByFilter(correlationId, filter);
            let set = new StatCounterValueSetV1_1.StatCounterValueSetV1(group, name, type, []);
            for (let record of records) {
                set.values.push(new StatCounterValueV1_1.StatCounterValueV1(record.year, record.month, record.day, record.hour, record.value));
            }
            return set;
        });
    }
    readCountersByGroup(correlationId, group, type, fromTime, toTime, timezone) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = pip_services3_commons_nodex_3.FilterParams.fromTuples('group', group, 'type', type, 'from_time', fromTime, 'to_time', toTime, 'timezone', timezone);
            let records = yield this._persistence.getListByFilter(correlationId, filter);
            let sets = {};
            let values = [];
            for (let record of records) {
                let set = sets[record.name];
                if (set == null) {
                    set = new StatCounterValueSetV1_1.StatCounterValueSetV1(record.group, record.name, type, []);
                    sets[record.name] = set;
                    values.push(set);
                }
                set.values.push(new StatCounterValueV1_1.StatCounterValueV1(record.year, record.month, record.day, record.hour, record.value));
            }
            return values;
        });
    }
    readCounters(correlationId, counters, type, fromTime, toTime, timezone) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            for (let counter of counters) {
                let set = yield this.readOneCounter(correlationId, counter.group, counter.name, type, fromTime, toTime, timezone);
                if (set)
                    result.push(set);
            }
            return result;
        });
    }
}
exports.StatisticsController = StatisticsController;
StatisticsController._defaultConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples('dependencies.persistence', 'service-statistics:persistence:*:*:1.0', 'options.facets_group', 'statistics');
//# sourceMappingURL=StatisticsController.js.map