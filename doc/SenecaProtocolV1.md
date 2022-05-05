# Seneca Protocol (version 1) <br/> Event Log Microservice

Event Log microservice implements a Seneca compatible API. 
Seneca port and protocol can be specified in the microservice [configuration](Configuration.md/#api_seneca). 

```javascript
var seneca = require('seneca')();

seneca.client({
    connection: {
        protocol: 'tcp', // Microservice seneca protocol
        localhost: 'localhost', // Microservice localhost
        port: 8800, // Microservice seneca port
    }
});
```

The microservice responds on the following requests:

```javascript
seneca.act(
    {
        role: 'statistics',
        version: 1,
        cmd: ...cmd name....
        ... Arguments ...
    },
    function (err, result) {
        ...
    }
);
```

* [StatCounterTypeV1 enum](#enum1)
* [StatCounterV1 class](#class1)
* [StatCounterValueV1 class](#class2)
* [StatCounterValueSetV1 class](#class2)
* [cmd: 'get_counters'](#operation1)
* [cmd: 'increment_counter'](#operation2)
* [cmd: 'read_one_counter'](#operation3)
* [cmd: 'read_counters'](#operation4)

## Data types

### <a name="enum1"></a> StatCounterTypeV1 enum

Defines types for counter for different type intervals

**Properties:**
- Total: 0 - counter for all times
- Year: 1 - counter for specific year
- Month: 2 - counter for specific month
- Day: 3 - counter for specific day
- Hour: 4 - counter for specific hour

### <a name="class1"></a> StatCounterV1 class

Contains counter composite id: group + name

**Properties:**
- group: string - counters group name (typically - server or user id)
- name: string - counter name (can repeat in groups)

### <a name="class2"></a> StatCounterValueV1 class

Contains counter value for specific period

**Properties:**
- year: number - (optional) - year of the counter interval
- month: number - (optional) - month of the counter interval
- day: number - (optional) - day of the counter interval
- hour: number - (optional) - hour of the counter interval

### <a name="class2"></a> StatCounterValueSetV1 class

Set of counter values for range of time intervals

**Properties:**
- group: string - counters group name (typically - server or user id)
- name: string - counter name (can repeat in groups)
- type: StatCounterTypeV1 - time of aggregated time interval

## Operations

### <a name="operation1"></a> Cmd: 'get_counters'

Retrieves a list of counter ids by specified criteria

**Arguments:** 
- filter: object - filter parameters
  - search: string - (optional) search substring to find in group or name
  - group: string - counters group name (typically - server or user id)
  - name: string - counter name (can repeat in groups)
  - from_time: Date - (optional) start of the time range
  - to_time: Date - (optional) end of the time range
- paging: object - paging parameters
  - skip: int - (optional) start of page (default: 0)
  - take: int - (optional) page length (default: 100)
  - total: boolean - (optional) include total counter into paged result (default: false)

**Returns:**
- err: Error - occured error or null for success
- result: DataPage<StatCounterV1> - retrieved page of counter ids

### <a name="operation2"></a> Cmd: 'increment_counter'

Increments specific counter by group and name

**Arguments:** 
- group: string - counters group name (typically - server or user id)
- name: string - counter name (can repeat in groups)
- time: Date - point of time when aggregation shall happen
- value: number - incremental value for the specified interval

**Returns:**
- err: Error - occured error or null for success

### <a name="operation3"></a> Cmd: 'read\_one\_counter'

Reads counter by group and name within specific time interval

**Arguments:** 
- group: string - counters group name (typically - server or user id)
- name: string - counter name (can repeat in groups)
- type: StatCounterTypeV1 - time of aggregated time interval
- from_time: Date - start of the time range
- to_time: Date - end of the time range

**Returns:**
- err: Error - occured error or null for success
- result: StatCounterValueSetV1 - set of retrieved counter values

### <a name="operation4"></a> Cmd: 'read\_counters'

Reads multiple counters within specific time interval

**Arguments:** 
- counters: StatCounterV1[] - list of counters to be read
- type: StatCounterTypeV1 - time of aggregated time interval
- from_time: Date - start of the time range
- to_time: Date - end of the time range

**Returns:**
- err: Error - occured error or null for success
- result: StatCounterValueSetV1[] - array of retrieved counter value sets


