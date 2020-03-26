/* eslint-disable @typescript-eslint/no-var-requires */
import nacl from "tweetnacl";
const blake2b = require("blake2b");
const base64 = require("bs64");
const stripZeroXString = (str: string): string => {
    if (str.startsWith("0x")) return str.substr(2);
    return str;
};

const genChannel = (): string => {
    const buffer = nacl.randomBytes(32);
    const hash = blake2b(32)
        .update(buffer)
        .digest();
    const str: string = base64.encode(Buffer.from(hash).toString("hex"));
    return str.substr(0, 5);
};

export { stripZeroXString, genChannel };
