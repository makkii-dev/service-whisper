import * as React from "react";
export interface Message {
    author?: string;
    date: number;
    text: string;
}

const Bubble: React.FC<{ message: Message }> = props => {
    const { message } = props;
    const positionClass = message.author ? "left" : "right";
    return React.useMemo(
        () => (
            <li className="history-bubble">
                <div className={`bubble ${positionClass}`}>{message.text}</div>
            </li>
        ),
        [message]
    );
};

const def: {
    messages: Message[];
    pushMessage: (e: Message) => void;
} = {
    messages: [],
    pushMessage: (m: Message) => {}
};

const historyContext = React.createContext(def);

const ChatHistory: React.FC = () => {
    const { messages } = React.useContext(historyContext);
    console.log(messages);
    const bubbles = messages.map((message, idx) => (
        <Bubble message={message} key={idx + ""} />
    ));
    return <ul className="history-contianer">{bubbles}</ul>;
};

const ChatHistoryWarpper: React.FC = props => {
    const messagesRef = React.useRef<Message[]>([]);
    const [messages, setMessages] = React.useState<Message[]>([]);
    return (
        <historyContext.Provider
            value={{
                messages: messages,
                pushMessage: (m: Message) => {
                    messagesRef.current.push(m);
                    setMessages([...messagesRef.current]);
                }
            }}
        >
            {props.children}
        </historyContext.Provider>
    );
};

export { ChatHistory, historyContext, ChatHistoryWarpper };
