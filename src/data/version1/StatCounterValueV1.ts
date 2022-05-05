export class StatCounterValueV1 {
    
    public constructor(year: number, month: number,
        day: number, hour: number, value: number) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.value = value;
    }

    public year?: number;
    public month?: number;
    public day?: number;
    public hour?: number;
    public value: number;
}