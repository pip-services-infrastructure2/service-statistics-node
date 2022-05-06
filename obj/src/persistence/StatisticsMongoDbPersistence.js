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
exports.StatisticsMongoDbPersistence = void 0;
const moment = require('moment-timezone');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_mongodb_nodex_1 = require("pip-services3-mongodb-nodex");
const StatCounterTypeV1_1 = require("../data/version1/StatCounterTypeV1");
const StatCounterKeyGenerator_1 = require("./StatCounterKeyGenerator");
class StatisticsMongoDbPersistence extends pip_services3_mongodb_nodex_1.IdentifiableMongoDbPersistence {
    constructor() {
        super('statistics');
        super.ensureIndex({ group: 1 });
        this._maxPageSize = 1000;
    }
    getGroups(correlationId, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            // Extract a page
            paging = paging != null ? paging : new pip_services3_commons_nodex_2.PagingParams();
            let skip = paging.getSkip(-1);
            let take = paging.getTake(this._maxPageSize);
            let filter = { type: 0 };
            let options = { group: 1 };
            let items = yield this._collection.find(filter, options).toArray();
            if (items != null) {
                items = items.map((item) => item.group);
                items = [...new Set(items)].sort();
                let total = null;
                if (paging.total)
                    total = items.length;
                if (skip > 0)
                    items = items.slice(skip);
                items = items.slice(0, take);
                let page = new pip_services3_commons_nodex_3.DataPage(items, total);
                return page;
            }
        });
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let criteria = [];
        let search = filter.getAsNullableString('search');
        if (search != null) {
            let searchRegex = new RegExp(search, "i");
            let searchCriteria = [];
            searchCriteria.push({ group: { $regex: searchRegex } });
            searchCriteria.push({ name: { $regex: searchRegex } });
            criteria.push({ $or: searchCriteria });
        }
        let group = filter.getAsNullableString('group');
        if (group != null)
            criteria.push({ group: group });
        let name = filter.getAsNullableString('name');
        if (name != null)
            criteria.push({ name: name });
        let type = filter.getAsNullableInteger('type');
        if (type != null)
            criteria.push({ type: type });
        let timezone = filter.getAsNullableString('timezone');
        let fromTime = filter.getAsNullableDateTime('from_time');
        let fromId = fromTime != null ? StatCounterKeyGenerator_1.StatCounterKeyGenerator.makeCounterKeyFromTime(group, name, type, fromTime, timezone) : null;
        if (fromId != null)
            criteria.push({ _id: { $gte: fromId } });
        let toTime = filter.getAsNullableDateTime('to_time');
        let toId = toTime != null ? StatCounterKeyGenerator_1.StatCounterKeyGenerator.makeCounterKeyFromTime(group, name, type, toTime, timezone) : null;
        if (toId != null)
            criteria.push({ _id: { $lte: toId } });
        return criteria.length > 0 ? { $and: criteria } : {};
    }
    getPageByFilter(correlationId, filter, paging) {
        const _super = Object.create(null, {
            getPageByFilter: { get: () => super.getPageByFilter }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.getPageByFilter.call(this, correlationId, this.composeFilter(filter), paging, null, null);
        });
    }
    getListByFilter(correlationId, filter) {
        const _super = Object.create(null, {
            getListByFilter: { get: () => super.getListByFilter }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.getListByFilter.call(this, correlationId, this.composeFilter(filter), null, null);
        });
    }
    addPartialIncrement(batch, group, name, type, momentTime, value) {
        let id = StatCounterKeyGenerator_1.StatCounterKeyGenerator.makeCounterKeyFromMoment(group, name, type, momentTime);
        let data = {
            group: group,
            name: name,
            type: type
        };
        if (type != StatCounterTypeV1_1.StatCounterTypeV1.Total) {
            data.year = momentTime.year();
            if (type != StatCounterTypeV1_1.StatCounterTypeV1.Year) {
                data.month = momentTime.month() + 1;
                if (type != StatCounterTypeV1_1.StatCounterTypeV1.Month) {
                    data.day = momentTime.date() + 1;
                    if (type != StatCounterTypeV1_1.StatCounterTypeV1.Day) {
                        data.hour = momentTime.hour();
                    }
                }
            }
        }
        batch
            .find({
            _id: id
        })
            .upsert()
            .updateOne({
            $set: data,
            $inc: {
                value: value
            }
        });
    }
    addOneIncrement(batch, group, name, time, timezone, value) {
        let tz = timezone || 'UTC';
        let momentTime = moment(time).tz(tz);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Total, momentTime, value);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Year, momentTime, value);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Month, momentTime, value);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Day, momentTime, value);
        this.addPartialIncrement(batch, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Hour, momentTime, value);
    }
    incrementOne(correlationId, group, name, time, timezone, value) {
        return __awaiter(this, void 0, void 0, function* () {
            let batch = this._collection.initializeUnorderedBulkOp();
            this.addOneIncrement(batch, group, name, time, timezone, value);
            return yield new Promise((resolve, reject) => {
                batch.execute((err) => {
                    if (err)
                        reject(err);
                    this._logger.trace(correlationId, "Incremented %s.%s", group, name);
                    resolve(null);
                });
            });
        });
    }
    incrementBatch(correlationId, increments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (increments == null || increments.length == 0) {
                return;
            }
            let batch = this._collection.initializeUnorderedBulkOp();
            for (let increment of increments) {
                this.addOneIncrement(batch, increment.group, increment.name, increment.time, increment.timezone, increment.value);
            }
            yield new Promise((resolve, reject) => {
                batch.execute((err) => {
                    if (err)
                        reject(err);
                    this._logger.trace(correlationId, "Incremented %d counters", increments.length);
                    resolve(null);
                });
            });
        });
    }
}
exports.StatisticsMongoDbPersistence = StatisticsMongoDbPersistence;
//# sourceMappingURL=StatisticsMongoDbPersistence.js.map