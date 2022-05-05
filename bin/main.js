let StatisticsProcess = require('../obj/src/container/StatisticsProcess').StatisticsProcess;

try {
    new StatisticsProcess().run(process.argv);
} catch (ex) {
    console.error(ex);
}
