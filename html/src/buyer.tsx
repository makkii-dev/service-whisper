/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from "react";

import { Label } from "./components";
import io from "socket.io-client";
import BuyerConnector from "../../src/connector/buyerConnector";
import {
    ChatHistory,
    historyContext,
    ChatHistoryWarpper
} from "./components/chatHistory";

const socket = io("ws://localhost:8888");
const buyer = new BuyerConnector(socket);

const Buyer = () => {
    const { pushMessage } = React.useContext(historyContext);
    buyer.listener = (msg: string) => {
        console.log("buyer[recv]<=", msg);
        pushMessage({ author: "seller", date: Date.now(), text: msg });
    };

    const onRegister = () => {
        const sigEle = document.querySelector<HTMLInputElement>(".buyer-sig");
        const idEle = document.querySelector<HTMLInputElement>(".buyer-id");
        const sig = sigEle!.value;
        const id = idEle!.value;
        const resultBanner = document.querySelector<HTMLDivElement>(
            ".buyer-container>.register-result"
        );
        buyer
            .register(sig, id)
            .then(ret => {
                console.log(ret);
                resultBanner!.textContent = "register success: \n";
            })
            .catch(e => {
                console.log(e);
                resultBanner!.textContent =
                    "register error: \n" + JSON.stringify(e);
            });
    };

    const onSend = () => {
        const textEle = document.querySelector<HTMLInputElement>(
            ".buyer-container>.text-field>input"
        );
        const msg = textEle!.value;
        if (!buyer.isRegister) {
            alert("buyer not register");
        } else if (msg === "") {
            alert("msg is null");
        } else {
            pushMessage({ date: Date.now(), text: msg });
            buyer.sendMsg(msg);
        }
    };

    return (
        <div className="buyer-container">
            <div className="banner"> Buyer</div>
            <div className="buyer-register">
                <Label label="signature">
                    <input className="buyer-sig" />
                </Label>
                <Label label="channel">
                    <input className="buyer-id" />
                </Label>
                <button className="register" onClick={onRegister} />
            </div>
            <div className="register-result" />
            <ChatHistory />
            <div className="text-field">
                <input />
            </div>
            <button className="send" onClick={onSend} />
        </div>
    );
};

export default () => (
    <ChatHistoryWarpper>
        <Buyer />
    </ChatHistoryWarpper>
);
