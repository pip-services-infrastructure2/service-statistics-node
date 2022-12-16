"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsServiceFactory = void 0;
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const StatisticsMongoDbPersistence_1 = require("../persistence/StatisticsMongoDbPersistence");
const StatisticsFilePersistence_1 = require("../persistence/StatisticsFilePersistence");
const StatisticsMemoryPersistence_1 = require("../persistence/StatisticsMemoryPersistence");
const StatisticsController_1 = require("../logic/StatisticsController");
const StatisticsCommandableHttpServiceV1_1 = require("../services/version1/StatisticsCommandableHttpServiceV1");
class StatisticsServiceFactory extends pip_services3_components_nodex_1.Factory {
    constructor() {
        super();
        this.registerAsType(StatisticsServiceFactory.MemoryPersistenceDescriptor, StatisticsMemoryPersistence_1.StatisticsMemoryPersistence);
        this.registerAsType(StatisticsServiceFactory.FilePersistenceDescriptor, StatisticsFilePersistence_1.StatisticsFilePersistence);
        this.registerAsType(StatisticsServiceFactory.MongoDbPersistenceDescriptor, StatisticsMongoDbPersistence_1.StatisticsMongoDbPersistence);
        this.registerAsType(StatisticsServiceFactory.ControllerDescriptor, StatisticsController_1.StatisticsController);
        this.registerAsType(StatisticsServiceFactory.CmdHttpServiceDescriptor, StatisticsCommandableHttpServiceV1_1.StatisticsCommandableHttpServiceV1);
    }
}
exports.StatisticsServiceFactory = StatisticsServiceFactory;
StatisticsServiceFactory.Descriptor = new pip_services3_commons_nodex_1.Descriptor("service-statistics", "factory", "default", "default", "1.0");
StatisticsServiceFactory.MemoryPersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-statistics", "persistence", "memory", "*", "1.0");
StatisticsServiceFactory.FilePersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-statistics", "persistence", "file", "*", "1.0");
StatisticsServiceFactory.MongoDbPersistenceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-statistics", "persistence", "mongodb", "*", "1.0");
StatisticsServiceFactory.ControllerDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-statistics", "controller", "default", "*", "1.0");
StatisticsServiceFactory.CmdHttpServiceDescriptor = new pip_services3_commons_nodex_1.Descriptor("service-statistics", "service", "commandable-http", "*", "1.0");
//# sourceMappingURL=StatisticsServiceFactory.js.map