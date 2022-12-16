import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { StatisticsMongoDbPersistence } from '../persistence/StatisticsMongoDbPersistence';
import { StatisticsFilePersistence } from '../persistence/StatisticsFilePersistence';
import { StatisticsMemoryPersistence } from '../persistence/StatisticsMemoryPersistence';
import { StatisticsController } from '../logic/StatisticsController';
import { StatisticsCommandableHttpServiceV1 } from '../services/version1/StatisticsCommandableHttpServiceV1';

export class StatisticsServiceFactory extends Factory {
	public static Descriptor = new Descriptor("service-statistics", "factory", "default", "default", "1.0");
	public static MemoryPersistenceDescriptor = new Descriptor("service-statistics", "persistence", "memory", "*", "1.0");
	public static FilePersistenceDescriptor = new Descriptor("service-statistics", "persistence", "file", "*", "1.0");
	public static MongoDbPersistenceDescriptor = new Descriptor("service-statistics", "persistence", "mongodb", "*", "1.0");
	public static ControllerDescriptor = new Descriptor("service-statistics", "controller", "default", "*", "1.0");
	public static CmdHttpServiceDescriptor = new Descriptor("service-statistics", "service", "commandable-http", "*", "1.0");
	
	constructor() {
		super();
		this.registerAsType(StatisticsServiceFactory.MemoryPersistenceDescriptor, StatisticsMemoryPersistence);
		this.registerAsType(StatisticsServiceFactory.FilePersistenceDescriptor, StatisticsFilePersistence);
		this.registerAsType(StatisticsServiceFactory.MongoDbPersistenceDescriptor, StatisticsMongoDbPersistence);
		this.registerAsType(StatisticsServiceFactory.ControllerDescriptor, StatisticsController);
		this.registerAsType(StatisticsServiceFactory.CmdHttpServiceDescriptor, StatisticsCommandableHttpServiceV1);
	}
	
}
