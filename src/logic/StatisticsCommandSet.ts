import { CommandSet } from 'pip-services3-commons-nodex';
import { ICommand } from 'pip-services3-commons-nodex';
import { Command } from 'pip-services3-commons-nodex';
import { Parameters } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { ObjectSchema } from 'pip-services3-commons-nodex';
import { ArraySchema } from 'pip-services3-commons-nodex';
import { TypeCode } from 'pip-services3-commons-nodex';
import { FilterParamsSchema } from 'pip-services3-commons-nodex';
import { PagingParamsSchema } from 'pip-services3-commons-nodex';

import { StatCounterV1Schema } from '../data/version1/StatCounterV1Schema';
import { StatCounterIncrementV1Schema } from '../data/version1/StatCounterIncrementV1Schema';
import { StatCounterV1 } from '../data/version1/StatCounterV1';
import { IStatisticsController } from './IStatisticsController';
import { StatCounterTypeV1 } from '..';

export class StatisticsCommandSet extends CommandSet {
    private _logic: IStatisticsController;

	constructor(logic: IStatisticsController) {
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

	private makeGetGroupsCommand(): ICommand {
		return new Command(
			"get_groups",
			new ObjectSchema(true)
				.withOptionalProperty('paging', new PagingParamsSchema()),
			async (correlationId: string, args: Parameters) => {
				let paging = PagingParams.fromValue(args.get("paging"));
				return await this._logic.getGroups(correlationId, paging);
			}
		);
	}

	private makeGetContersCommand(): ICommand {
		return new Command(
			"get_counters",
			new ObjectSchema(true)
				.withOptionalProperty('filter', new FilterParamsSchema())
				.withOptionalProperty('paging', new PagingParamsSchema()),
			async (correlationId: string, args: Parameters) => {
				let filter = FilterParams.fromValue(args.get("filter"));
				let paging = PagingParams.fromValue(args.get("paging"));
				return await this._logic.getCounters(correlationId, filter, paging);
			}
		);
	}

	private makeIncrementCounterCommand(): ICommand {
		return new Command(
			"increment_counter",
			new ObjectSchema(true)
				.withRequiredProperty('group', TypeCode.String)
				.withRequiredProperty('name', TypeCode.String)
				.withOptionalProperty('time', TypeCode.DateTime)
				.withOptionalProperty('timezone', TypeCode.String)
				.withRequiredProperty('value', TypeCode.Float),
			async (correlationId: string, args: Parameters) => {
				let group = args.getAsNullableString("group");
				let name = args.getAsNullableString("name");
				let time = args.getAsNullableDateTime("time");
				let timezone = args.getAsNullableString("timezone");
				let value = args.getAsDouble("value");
				return await this._logic.incrementCounter(correlationId, group, name, time, timezone, value);
			}
		);
	}

	private makeIncrementCountersCommand(): ICommand {
		return new Command(
			"increment_counters",
			new ObjectSchema(true)
				.withRequiredProperty('increments', new ArraySchema(new StatCounterIncrementV1Schema())),
			async (correlationId: string, args: Parameters) => {
				let increments = args.getAsObject("increments");
				return await this._logic.incrementCounters(correlationId, increments);
			}
		);
	}

	private makeReadOneCounterCommand(): ICommand {
		return new Command(
			"read_one_counter",
			new ObjectSchema(true)
				.withRequiredProperty('group', TypeCode.String)
				.withRequiredProperty('name', TypeCode.String)
				.withRequiredProperty('type', TypeCode.Long)
				.withOptionalProperty('from_time', TypeCode.DateTime)
				.withOptionalProperty('to_time', TypeCode.DateTime)
				.withOptionalProperty('timezone', TypeCode.String),
			async (correlationId: string, args: Parameters) => {
				let group = args.getAsNullableString("group");
				let name = args.getAsNullableString("name");
				let type = args.getAsIntegerWithDefault("type", StatCounterTypeV1.Total);
				let fromTime = args.getAsNullableDateTime("from_time");
				let toTime = args.getAsNullableDateTime("to_time");
				let timezone = args.getAsNullableString("timezone");
				return await this._logic.readOneCounter(correlationId, group, name, type, fromTime, toTime, timezone);
			}
		);
	}

	private makeReadCountersByGroupCommand(): ICommand {
		return new Command(
			"read_counters_by_group",
			new ObjectSchema(true)
				.withRequiredProperty('group', TypeCode.String)
				.withRequiredProperty('type', TypeCode.Long)
				.withOptionalProperty('from_time', TypeCode.DateTime)
				.withOptionalProperty('to_time', TypeCode.DateTime)
				.withOptionalProperty('timezone', TypeCode.String),
			async (correlationId: string, args: Parameters) => {
				let group = args.getAsNullableString("group");
				let type = args.getAsIntegerWithDefault("type", StatCounterTypeV1.Total);
				let fromTime = args.getAsNullableDateTime("from_time");
				let toTime = args.getAsNullableDateTime("to_time");
				let timezone = args.getAsNullableString("timezone");
				return await this._logic.readCountersByGroup(correlationId, group, type, fromTime, toTime, timezone);
			}
		);
	}

	private makeReadCountersCommand(): ICommand {
		return new Command(
			"read_counters",
			new ObjectSchema(true)
				.withRequiredProperty('counters', new ArraySchema(new StatCounterV1Schema()))
				.withRequiredProperty('type', TypeCode.Long)
				.withOptionalProperty('from_time', TypeCode.DateTime)
				.withOptionalProperty('to_time', TypeCode.DateTime)
				.withOptionalProperty('timezone', TypeCode.String),
			async (correlationId: string, args: Parameters) => {
				let counters: StatCounterV1[] = args.get("counters");
				let type = args.getAsIntegerWithDefault("type", StatCounterTypeV1.Total);
				let fromTime = args.getAsNullableDateTime("from_time");
				let toTime = args.getAsNullableDateTime("to_time");
				let timezone = args.getAsNullableString("timezone");
				return await this._logic.readCounters(correlationId, counters, type, fromTime, toTime, timezone);
			}
		);
	}
}