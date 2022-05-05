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
exports.StatisticsMemoryPersistence = void 0;
const moment = require('moment-timezone');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_data_nodex_1 = require("pip-services3-data-nodex");
const StatCounterTypeV1_1 = require("../data/version1/StatCounterTypeV1");
const StatCounterKeyGenerator_1 = require("./StatCounterKeyGenerator");
class StatisticsMemoryPersistence extends pip_services3_data_nodex_1.IdentifiableMemoryPersistence {
    constructor() {
        super();
        this._maxPageSize = 1000;
    }
    getGroups(correlationId, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = this._items.map((item) => item.group);
            items = [...new Set(items)].sort();
            // Extract a page
            paging = paging != null ? paging : new pip_services3_commons_nodex_2.PagingParams();
            let skip = paging.getSkip(-1);
            let take = paging.getTake(this._maxPageSize);
            let total = null;
            if (paging.total)
                total = items.length;
            if (skip > 0)
                items = items.slice(skip);
            items = items.slice(0, take);
            let page = new pip_services3_commons_nodex_3.DataPage(items, total);
            return page;
        });
    }
    matchString(value, search) {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }
    matchSearch(item, search) {
        search = search.toLowerCase();
        if (this.matchString(item.group, search))
            return true;
        if (this.matchString(item.name, search))
            return true;
        return false;
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let search = filter.getAsNullableString('search');
        let group = filter.getAsNullableString('group');
        let name = filter.getAsNullableString('name');
        let type = filter.getAsNullableInteger('type');
        let timezone = filter.getAsNullableString('timezone');
        let fromTime = filter.getAsNullableDateTime('from_time');
        let fromId = fromTime != null ? StatCounterKeyGenerator_1.StatCounterKeyGenerator.makeCounterKeyFromTime(group, name, type, fromTime, timezone) : null;
        let toTime = filter.getAsNullableDateTime('to_time');
        let toId = toTime != null ? StatCounterKeyGenerator_1.StatCounterKeyGenerator.makeCounterKeyFromTime(group, name, type, toTime, timezone) : null;
        return (item) => {
            if (search != null && !this.matchSearch(item, search))
                return false;
            if (type != null && type != item.type)
                return false;
            if (group != null && item.group != group)
                return false;
            if (name != null && item.name != name)
                return false;
            if (fromId != null && item.id < fromId)
                return false;
            if (toId != null && item.id > toId)
                return false;
            return true;
        };
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
    incrementPartial(correlationId, group, name, type, momentTime, value) {
        let id = StatCounterKeyGenerator_1.StatCounterKeyGenerator.makeCounterKeyFromMoment(group, name, type, momentTime);
        let item = this._items.find((x) => { return x.id == id; });
        if (item != null) {
            item.value += value;
        }
        else {
            item = {
                id: id,
                group: group,
                name: name,
                type: type,
                value: value
            };
            if (type != StatCounterTypeV1_1.StatCounterTypeV1.Total) {
                item.year = momentTime.year();
                if (type != StatCounterTypeV1_1.StatCounterTypeV1.Year) {
                    item.month = momentTime.month() + 1;
                    if (type != StatCounterTypeV1_1.StatCounterTypeV1.Month) {
                        item.day = momentTime.date();
                        if (type != StatCounterTypeV1_1.StatCounterTypeV1.Day) {
                            item.hour = momentTime.hour();
                        }
                    }
                }
            }
            this._items.push(item);
        }
        return item;
    }
    incrementOne(correlationId, group, name, time, timezone, value) {
        return __awaiter(this, void 0, void 0, function* () {
            let tz = timezone || 'UTC';
            let momentTime = moment(time).tz(tz);
            this.incrementPartial(correlationId, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Total, momentTime, value);
            this.incrementPartial(correlationId, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Year, momentTime, value);
            this.incrementPartial(correlationId, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Month, momentTime, value);
            this.incrementPartial(correlationId, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Day, momentTime, value);
            this.incrementPartial(correlationId, group, name, StatCounterTypeV1_1.StatCounterTypeV1.Hour, momentTime, value);
            this._logger.trace(correlationId, "Incremented %s.%s", group, name);
            yield this.save(correlationId);
        });
    }
    incrementBatch(correlationId, increments) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let inc of increments)
                yield this.incrementOne(correlationId, inc.group, inc.name, inc.time, inc.timezone, inc.value);
        });
    }
}
exports.StatisticsMemoryPersistence = StatisticsMemoryPersistence;
//# sourceMappingURL=StatisticsMemoryPersistence.js.map