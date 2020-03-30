/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import ReactDOM from "react-dom";
import Buyer from "./buyer";
import Seller from "./seller";
import "./styles.less";

const App: React.FC = () => {
    return (
        <>
            <Seller />
            <Buyer />
        </>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
