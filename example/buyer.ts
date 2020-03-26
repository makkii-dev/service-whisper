import BuyerConnector from "../src/connector/buyerConnector";
import io from "socket.io-client";
import repl from "repl";

const socket = io("ws://localhost:8888");

const buyerConnector = new BuyerConnector(socket);

const context = repl.start(">").context;
context.buyer = buyerConnector;
