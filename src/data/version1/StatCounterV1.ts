export class StatCounterV1 {
    
    public constructor(group: string, name: string) {
        this.group = group;
        this.name = name;
    }

    public group: string;
    public name: string;
}