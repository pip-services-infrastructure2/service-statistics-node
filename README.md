# Statistics Microservice

This is a system event logging microservice from Pip.Services library. 
It logs important system events like starts and stops of servers,
upgrades to a new version, fatal system errors or key business transactions.

The microservice currently supports the following deployment options:
* Deployment platforms: Standalone Process, Seneca Plugin
* External APIs: HTTP/REST, Seneca
* Persistence: Memory, Flat Files, MongoDB

This microservice has no dependencies on other microservices.

<a name="links"></a> Quick Links:

* [Download Links](doc/Downloads.md)
* [Development Guide](doc/Development.md)
* [Configuration Guide](doc/Configuration.md)
* [Deployment Guide](doc/Deployment.md)
* Client SDKs
  - [Node.js SDK](https://github.com/pip-services-infrastructure2/client-statistics-node)
* Communication Protocols
  - [HTTP Version 1](doc/HttpProtocolV1.md)
  - [Seneca Version 1](doc/SenecaProtocolV1.md)

##  Contract

Logical contract of the microservice is presented below. For physical implementation (HTTP/REST, Thrift, Seneca, Lambda, etc.),
please, refer to documentation of the specific protocol.

```typescript
enum StatCounterTypeV1
{
    Total = 0,
    Year = 1,
    Month = 2,
    Day = 3,
    Hour = 4
}

class StatCounterV1
{
    public group: string;
    public name: string;
}

class StatCounterValueV1
{
    public year: number;
    public month: number;
    public day: number;
    public hour: number;
    public value: number;
}

class StatCounterValueSetV1
{
    public group: string;
    public name: string;
    public type: StatCounterTypeV1;
    public values: StatCounterValueV1[];
}

interface IStatisticsV1 {
    getGroups(correlationId: string, paging: PagingParams): Promise<DataPage<string>>;

    getCounters(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<StatCounterV1>>;
    
    incrementCounter(correlationId: string, group: string, name: string,
        time: Date, value: number): Promise<void>;

    readOneCounter(correlationId: string, group: string, name: string, type: StatCounterTypeV1,
        fromTime: Date, toTime: Date): Promise<StatCounterValueSetV1>;

    readCountersByGroup(correlationId: string, group: string, type: StatCounterTypeV1,
        fromTime: Date, toTime: Date): Promise<StatCounterValueSetV1[]>;

    readCounters(correlationId: string, counters: StatCounterV1[], type: StatCounterTypeV1,
        fromTime: Date, toTime: Date): Promise<StatCounterValueSetV1[]>;
}

```

## Download

Right now the only way to get the microservice is to check it out directly from github repository
```bash
git clone git@github.com:pip-services-infrastructure2/service-statistics-node.git
```

Pip.Service team is working to implement packaging and make stable releases available for your 
as zip downloadable archieves.

## Run

Add **config.json** file to the root of the microservice folder and set configuration parameters.
As the starting point you can use example configuration from **config.example.yml** file. 

Example of microservice configuration
```yaml
- descriptor: "pip-services-container:container-info:default:default:1.0"
  name: "service-statistics"
  description: "Statistics microservice"

- descriptor: "pip-services-commons:logger:console:default:1.0"
  level: "trace"

- descriptor: "service-statistics:persistence:file:default:1.0"
  path: "./data/statistics.json"

- descriptor: "service-statistics:controller:default:default:1.0"

- descriptor: "service-statistics:service:http:default:1.0"
  connection:
    protocol: "http"
    host: "0.0.0.0"
    port: 3000
```
 
For more information on the microservice configuration see [Configuration Guide](Configuration.md).

Start the microservice using the command:
```bash
node run
```

## Use

The easiest way to work with the microservice is to use client SDK. 
The complete list of available client SDKs for different languages is listed in the [Quick Links](#links)

If you use Node.js then you should add dependency to the client SDK into **package.json** file of your project
```javascript
{
    ...
    dependencies: {
        ...
        "client-statistics-node": "^1.0.*"
        ...
    }
}
```

Inside your code get the reference to the client SDK
```javascript
var sdk = new require('client-statistics-node');
```

Define client configuration parameters that match configuration of the microservice external API
```javascript
// Client configuration
var config = {
    connection: {
        protocol: 'http',
        host: 'localhost', 
        port: 8080
    }
};
```

Instantiate the client and open connection to the microservice
```javascript
// Create the client instance
var client = sdk.StatisticsHttpClientV1(config);

// Connect to the microservice
try {
    await client.open(null);
    // Work with the microservice
    ...
} catch(err) {
    console.error('Connection to the microservice failed');
    console.error(err);
}

```

Now the client is ready to perform operations
```javascript
// Increment counter
await client.incrementCounter(
    null,
    '123',
    'test_counter',
    1
);
```

```javascript

// Get the list system events
let value = awiat client.readTotalCounter(
    null,
    '123',
    'test_counter'
);
```    

## Acknowledgements

This microservice was created and currently maintained by *Sergey Seroukhov*.

