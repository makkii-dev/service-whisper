/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Server } from "http";
import Express from "express";
import Sokcetio from "socket.io";
import SocketMap from "./socketMap";

const app = Express();
const ser = new Server(app);
const soc = Sokcetio(ser);

ser.listen(8888);

const Maps = new Map<string, SocketMap>();

soc.on("connection", socket => {
    console.log("conn=>", socket.id);
    socket.addListener("register", (payload: any) => {
        console.log("current session number:", Maps.size);
        if (payload.from === "seller") {
            const { pubkey } = payload;
            const socketMap = new SocketMap();
            const ret = socketMap.setSellerSocket(socket, pubkey);
            if (ret.result) {
                const idx = ret.channel!;
                socketMap.setDisconnectHandler((id: string) => {
                    Maps.delete(id);
                });
                Maps.set(idx, socketMap);
                socket.emit("register", {
                    result: true,
                    body: {
                        channel: ret.channel,
                        id: idx
                    }
                });
            } else {
                socket.emit("register", {
                    result: false,
                    body: ret.reason
                });
            }
        } else if (payload.from === "buyer") {
            const { id, signature = "" } = payload;
            const socketMap = Maps.get(id);
            if (typeof socketMap === "undefined") {
                socket.emit("register", {
                    result: false,
                    body: "socketMap not found"
                });
            } else {
                const ret = socketMap.setBuyerSocket(socket, signature);
                if (ret.result) {
                    socket.emit("register", {
                        result: true,
                        body: {
                            channel: socketMap.channel
                        }
                    });
                } else {
                    socket.emit("register", {
                        result: false,
                        body: ret.reason
                    });
                }
            }
        }
    });
});
