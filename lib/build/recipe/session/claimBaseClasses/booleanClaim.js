import { PrimitiveClaim } from "./primitiveClaim";
export class BooleanClaim extends PrimitiveClaim {
    constructor(conf) {
        super(conf);
        this.validators = Object.assign(Object.assign({}, this.validators), { isTrue: (maxAge, id) => this.validators.hasValue(true, maxAge, id), isFalse: (maxAge, id) => this.validators.hasValue(false, maxAge, id) });
    }
}
