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
exports.StatisticsCommandSet = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_6 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_7 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_8 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_9 = require("pip-services3-commons-nodex");
const StatCounterV1Schema_1 = require("../data/version1/StatCounterV1Schema");
const StatCounterIncrementV1Schema_1 = require("../data/version1/StatCounterIncrementV1Schema");
const __1 = require("..");
class StatisticsCommandSet extends pip_services3_commons_nodex_1.CommandSet {
    constructor(logic) {
        super();
        this._logic = logic;
        // Register commands to the database
        this.addCommand(this.makeGetGroupsCommand());
        this.addCommand(this.makeGetContersCommand());
        this.addCommand(this.makeIncrementCounterCommand());
        this.addCommand(this.makeIncrementCountersCommand());
        this.addCommand(this.makeReadCountersCommand());
        this.addCommand(this.makeReadCountersByGroupCommand());
        this.addCommand(this.makeReadOneCounterCommand());
    }
    makeGetGroupsCommand() {
        return new pip_services3_commons_nodex_2.Command("get_groups", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withOptionalProperty('paging', new pip_services3_commons_nodex_9.PagingParamsSchema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let paging = pip_services3_commons_nodex_4.PagingParams.fromValue(args.get("paging"));
            return yield this._logic.getGroups(correlationId, paging);
        }));
    }
    makeGetContersCommand() {
        return new pip_services3_commons_nodex_2.Command("get_counters", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withOptionalProperty('filter', new pip_services3_commons_nodex_8.FilterParamsSchema())
            .withOptionalProperty('paging', new pip_services3_commons_nodex_9.PagingParamsSchema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let filter = pip_services3_commons_nodex_3.FilterParams.fromValue(args.get("filter"));
            let paging = pip_services3_commons_nodex_4.PagingParams.fromValue(args.get("paging"));
            return yield this._logic.getCounters(correlationId, filter, paging);
        }));
    }
    makeIncrementCounterCommand() {
        return new pip_services3_commons_nodex_2.Command("increment_counter", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty('group', pip_services3_commons_nodex_7.TypeCode.String)
            .withRequiredProperty('name', pip_services3_commons_nodex_7.TypeCode.String)
            .withOptionalProperty('time', pip_services3_commons_nodex_7.TypeCode.DateTime)
            .withOptionalProperty('timezone', pip_services3_commons_nodex_7.TypeCode.String)
            .withRequiredProperty('value', pip_services3_commons_nodex_7.TypeCode.Float), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let group = args.getAsNullableString("group");
            let name = args.getAsNullableString("name");
            let time = args.getAsNullableDateTime("time");
            let timezone = args.getAsNullableString("timezone");
            let value = args.getAsDouble("value");
            return yield this._logic.incrementCounter(correlationId, group, name, time, timezone, value);
        }));
    }
    makeIncrementCountersCommand() {
        return new pip_services3_commons_nodex_2.Command("increment_counters", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty('increments', new pip_services3_commons_nodex_6.ArraySchema(new StatCounterIncrementV1Schema_1.StatCounterIncrementV1Schema())), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let increments = args.getAsObject("increments");
            return yield this._logic.incrementCounters(correlationId, increments);
        }));
    }
    makeReadOneCounterCommand() {
        return new pip_services3_commons_nodex_2.Command("read_one_counter", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty('group', pip_services3_commons_nodex_7.TypeCode.String)
            .withRequiredProperty('name', pip_services3_commons_nodex_7.TypeCode.String)
            .withRequiredProperty('type', pip_services3_commons_nodex_7.TypeCode.Long)
            .withOptionalProperty('from_time', pip_services3_commons_nodex_7.TypeCode.DateTime)
            .withOptionalProperty('to_time', pip_services3_commons_nodex_7.TypeCode.DateTime)
            .withOptionalProperty('timezone', pip_services3_commons_nodex_7.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let group = args.getAsNullableString("group");
            let name = args.getAsNullableString("name");
            let type = args.getAsIntegerWithDefault("type", __1.StatCounterTypeV1.Total);
            let fromTime = args.getAsNullableDateTime("from_time");
            let toTime = args.getAsNullableDateTime("to_time");
            let timezone = args.getAsNullableString("timezone");
            return yield this._logic.readOneCounter(correlationId, group, name, type, fromTime, toTime, timezone);
        }));
    }
    makeReadCountersByGroupCommand() {
        return new pip_services3_commons_nodex_2.Command("read_counters_by_group", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty('group', pip_services3_commons_nodex_7.TypeCode.String)
            .withRequiredProperty('type', pip_services3_commons_nodex_7.TypeCode.Long)
            .withOptionalProperty('from_time', pip_services3_commons_nodex_7.TypeCode.DateTime)
            .withOptionalProperty('to_time', pip_services3_commons_nodex_7.TypeCode.DateTime)
            .withOptionalProperty('timezone', pip_services3_commons_nodex_7.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let group = args.getAsNullableString("group");
            let type = args.getAsIntegerWithDefault("type", __1.StatCounterTypeV1.Total);
            let fromTime = args.getAsNullableDateTime("from_time");
            let toTime = args.getAsNullableDateTime("to_time");
            let timezone = args.getAsNullableString("timezone");
            return yield this._logic.readCountersByGroup(correlationId, group, type, fromTime, toTime, timezone);
        }));
    }
    makeReadCountersCommand() {
        return new pip_services3_commons_nodex_2.Command("read_counters", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty('counters', new pip_services3_commons_nodex_6.ArraySchema(new StatCounterV1Schema_1.StatCounterV1Schema()))
            .withRequiredProperty('type', pip_services3_commons_nodex_7.TypeCode.Long)
            .withOptionalProperty('from_time', pip_services3_commons_nodex_7.TypeCode.DateTime)
            .withOptionalProperty('to_time', pip_services3_commons_nodex_7.TypeCode.DateTime)
            .withOptionalProperty('timezone', pip_services3_commons_nodex_7.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let counters = args.get("counters");
            let type = args.getAsIntegerWithDefault("type", __1.StatCounterTypeV1.Total);
            let fromTime = args.getAsNullableDateTime("from_time");
            let toTime = args.getAsNullableDateTime("to_time");
            let timezone = args.getAsNullableString("timezone");
            return yield this._logic.readCounters(correlationId, counters, type, fromTime, toTime, timezone);
        }));
    }
}
exports.StatisticsCommandSet = StatisticsCommandSet;
//# sourceMappingURL=StatisticsCommandSet.js.map