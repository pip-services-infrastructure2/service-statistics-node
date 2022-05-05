import { CommandSet } from 'pip-services3-commons-nodex';
import { IStatisticsController } from './IStatisticsController';
export declare class StatisticsCommandSet extends CommandSet {
    private _logic;
    constructor(logic: IStatisticsController);
    private makeGetGroupsCommand;
    private makeGetContersCommand;
    private makeIncrementCounterCommand;
    private makeIncrementCountersCommand;
    private makeReadOneCounterCommand;
    private makeReadCountersByGroupCommand;
    private makeReadCountersCommand;
}
