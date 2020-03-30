import * as React from "react";
import "./styles.less";
interface LabelProps {
    label: string;
}

const Label: React.FC<LabelProps> = props => {
    const { label, children } = props;
    return (
        <div className="label-container">
            <div className="label-text">{label + ":"}</div>
            <div className="label-child">{children}</div>
        </div>
    );
};

export { Label };
