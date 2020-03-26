import SellerConnector from "../src/connector/sellerConnector";
import io from "socket.io-client";
import repl from "repl";

const socket = io("ws://localhost:8888");

const sellerConnector = new SellerConnector(socket);

const context = repl.start(">").context;
context.seller = sellerConnector;
