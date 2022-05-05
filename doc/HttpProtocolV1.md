# HTTP Protocol (version 1) <br/> Event Log Microservice

Statistics microservice implements a HTTP compatible API, that can be accessed on configured port.
All input and output data is serialized in JSON format. Errors are returned in [standard format]().

* [StatCounterTypeV1 enum](#enum1)
* [StatCounterV1 class](#class1)
* [StatCounterValueV1 class](#class2)
* [StatCounterValueSetV1 class](#class2)
* [POST /statistics/read_counters](#operation1)
* [POST /statistics/increment_counter](#operation2)
* [POST /statistics/read_one_counter](#operation3)
* [POST /statistics/read_counters](#operation4)

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

### <a name="operation1"></a> Method: 'POST', route '/statistics/get_counters'

Retrieves a list of counter ids by specified criteria

**Request body:** 
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

**Response body:**
DataPage<StatCounterV1> object or error

### <a name="operation2"></a> Method: 'POST', route '/statistics/increment_counter'

Increments specific counter by group and name

**Request body:** 
- group: string - counters group name (typically - server or user id)
- name: string - counter name (can repeat in groups)
- time: Date - point of time when aggregation shall happen
- value: number - incremental value for the specified interval

**Response body:**
- Occured error or null for success

### <a name="operation3"></a> 'POST', route '/statistics/read\_one\_counter'

Reads counter by group and name within specific time interval

**Request body:** 
- group: string - counters group name (typically - server or user id)
- name: string - counter name (can repeat in groups)
- type: StatCounterTypeV1 - time of aggregated time interval
- from_time: Date - start of the time range
- to_time: Date - end of the time range

**Response body:**
- StatCounterValueSetV1 object or error

### <a name="operation3"></a> 'POST', route '/statistics/read\_counters'

Reads multiple counters within specific time interval

**Request body:** 
- counters: StatCounterV1[] - list of counters to be read
- type: StatCounterTypeV1 - time of aggregated time interval
- from_time: Date - start of the time range
- to_time: Date - end of the time range

**Response body:**
- StatCounterValueSetV1[] object or error

