/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Socket } from "socket.io";
import nacl from "tweetnacl";
import { stripZeroXString, genChannel } from "./util";
const blake2b = require("blake2b");
type Connector = Socket | undefined;
type DisconnectHandler = (id: string) => void;
class SocketMap {
    sellerSocket: Connector;

    sellerPubkey = "";

    buyerScoket: Connector;

    channel = "";

    disconnectHandler = (id: string): void => {
        console.log("disconnect id:", id);
    };

    setDisconnectHandler = (handler: DisconnectHandler): void => {
        this.disconnectHandler = handler;
    };
    setChannel = (channel_: string): void => {
        this.channel = channel_;
    };

    setSellerSocket = (
        socket: Socket,
        pubkey: string
    ): {
        result: boolean;
        channel?: string;
        reason?: string;
    } => {
        if (
            typeof pubkey !== "string" ||
            stripZeroXString(pubkey).length !== 64
        ) {
            return { result: false, reason: "invalid public key" };
        }
        this.sellerSocket = socket;
        this.sellerPubkey = pubkey;
        this.channel = genChannel();
        return { result: true, channel: this.channel };
    };

    setBuyerSocket = (
        socket: Socket,
        signature: string
    ): { result: boolean; reason?: string } => {
        if (typeof this.sellerSocket === "undefined") {
            return { result: false, reason: "seller sokcet not set" };
        }

        const msg = blake2b(32)
            .update(Buffer.from(this.channel))
            .digest();
        const res = nacl.sign.detached.verify(
            msg,
            Buffer.from(stripZeroXString(signature), "hex"),
            Buffer.from(stripZeroXString(this.sellerPubkey), "hex")
        );
        if (!res) {
            return { result: false, reason: "invalid sigture" };
        }
        if (typeof this.buyerScoket != "undefined") {
            return { result: false, reason: "this channel already use" };
        }

        this.buyerScoket = socket;
        this.init();
        return { result: true };
    };

    init = (): void => {
        this.sellerSocket?.removeAllListeners("say" + this.channel);
        this.buyerScoket?.removeAllListeners("say" + this.channel);
        this.sellerSocket?.addListener(
            "say" + this.channel,
            this.sellerListener
        );
        this.buyerScoket?.addListener("say" + this.channel, this.buyerListener);
        this.buyerScoket?.on("disconnect", () => {
            this.disconnectHandler(this.channel);
        });
        this.sellerSocket?.on("disconnect", () => {
            this.disconnectHandler(this.channel);
        });
    };

    sellerListener = (payload: any): void => {
        if (!this.buyerScoket!.emit("say" + this.channel, payload)) {
            this.sellerSocket!.emit(
                "say" + this.channel,
                "seller socket disconnect"
            );
        }
    };

    buyerListener = (payload: any): void => {
        if (!this.sellerSocket!.emit("say" + this.channel, payload)) {
            this.buyerScoket!.emit(
                "say" + this.channel,
                "buyer socket disconnect"
            );
        }
    };

    sessionListener = (sender: Socket): void => {
        if (
            this.buyerScoket &&
            this.sellerSocket &&
            this.buyerScoket.connected &&
            this.sellerSocket.connected
        ) {
            sender.emit("session", {
                connect: true,
                buyer: {
                    id: this.buyerScoket.id
                },
                seller: {
                    id: this.sellerSocket.id
                }
            });
        }
        sender.emit("session", {
            connect: false
        });
    };
}

export default SocketMap;
