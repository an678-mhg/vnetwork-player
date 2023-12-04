// icon:pause | Material Design Icons https://materialdesignicons.com/ | Austin Andrews
import * as React from "react";

function IconPause(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            height="1em"
            width="1em"
            {...props}
        >
            <path d="M14 19h4V5h-4M6 19h4V5H6v14z" />
        </svg>
    );
}

export default IconPause;
