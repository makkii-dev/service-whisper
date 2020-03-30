/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from "react";
import {
    ChatHistory,
    historyContext,
    ChatHistoryWarpper
} from "./components/chatHistory";

import io from "socket.io-client";
import SellerConnector from "../../src/connector/sellerConnector";

const scoket = io("ws://localhost:8888");
const seller = new SellerConnector(scoket);
const Seller = () => {
    const { pushMessage } = React.useContext(historyContext);

    seller.listener = (msg: string) => {
        console.log("seller[recv]<=", msg);
        pushMessage({ author: "buyer", date: Date.now(), text: msg });
    };

    const onRegister = () => {
        const resultBanner = document.querySelector<HTMLDivElement>(
            ".seller-container>.register-result"
        );
        seller
            .register()
            .then(ret => {
                console.log(ret);
                resultBanner!.textContent =
                    "register success: \n" + JSON.stringify(ret.body);
            })
            .catch(e => {
                resultBanner!.textContent =
                    "register error: \n" + JSON.stringify(e);
            });
    };

    const onSend = () => {
        const textEle = document.querySelector<HTMLInputElement>(
            ".seller-container>.text-field>input"
        );
        const msg = textEle!.value;
        if (!seller.isRegister) {
            alert("seller not register");
        } else if (msg === "") {
            alert("msg is null");
        } else {
            pushMessage({ date: Date.now(), text: msg });
            seller.sendMsg(msg);
        }
    };
    return (
        <div className="seller-container">
            <div className="banner">Seller</div>
            <div className="seller-register">
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
        <Seller />
    </ChatHistoryWarpper>
);
