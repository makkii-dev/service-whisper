/* eslint-disable @typescript-eslint/no-var-requires */
import BaseConnector, { Deferred } from "./baseConnector";
import nacl from "tweetnacl";
import { stripZeroXString } from "../util";

const blake2b = require("blake2b");

class SellerConnector extends BaseConnector {
    priKey: string;
    pubkey: string;
    isRegister = false;
    deferred = new Deferred();
    constructor(socket: SocketIOClientStatic["Socket"], priKey?: string) {
        super({
            prefix: "seller",
            socket
        });
        if (typeof priKey != "undefined") {
            this.priKey = stripZeroXString(priKey);
            try {
                this.pubkey = Buffer.from(
                    nacl.sign.keyPair.fromSecretKey(
                        Buffer.from(stripZeroXString(priKey), "hex")
                    ).publicKey
                ).toString("hex");
            } catch (err) {
                throw new Error("invalid prikey=>" + priKey);
            }
        } else {
            const keyPair = nacl.sign.keyPair.fromSeed(
                nacl.randomBytes(nacl.sign.seedLength)
            );

            this.priKey = Buffer.from(keyPair.secretKey).toString("hex");
            this.pubkey = Buffer.from(keyPair.publicKey).toString("hex");
        }
    }

    register = (): Promise<any> => {
        const payload = {
            pubkey: this.pubkey,
            from: "seller"
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
            // register success
            const { channel, id } = body;
            this.setChannel(channel);
            this.init();
            const sig = this.genSig(channel);
            this.deferred.resolve({
                result: true,
                body: { sigature: sig, id }
            });
            this.isRegister = true;
        } else {
            this.deferred.reject(payload);
        }
    };

    genSig = (msg: string): string => {
        const hash = blake2b(32)
            .update(Buffer.from(msg))
            .digest();
        const sig = nacl.sign.detached(hash, Buffer.from(this.priKey, "hex"));
        return Buffer.from(sig).toString("hex");
    };
}

export default SellerConnector;
