import BaseConnector, { Deferred } from "./baseConnector";

class BuyerConnector extends BaseConnector {
    deferred = new Deferred();
    isRegister = false;
    constructor(socket: SocketIOClientStatic["Socket"]) {
        super({
            prefix: "buyer",
            socket
        });
    }
    register = (sig: string, id: string): Promise<any> => {
        const payload = {
            id,
            signature: sig,
            from: "buyer"
        };
        this.socket.emit("register", payload);
        this.deferred = new Deferred();
        this.socket.removeListener("register", this.registerListener);
        this.socket.addEventListener("register", this.registerListener);
        return this.deferred;
    };

    registerListener = (payload: { result: boolean; body: any }): void => {
        const { result, body } = payload;
        if (result) {
            const { channel } = body;
            // register success
            this.setChannel(channel);
            this.init();
            this.deferred.resolve({ result: true });
            this.isRegister = true;
        } else {
            // register failed
            this.deferred.reject(payload);
        }
    };
}

export default BuyerConnector;
