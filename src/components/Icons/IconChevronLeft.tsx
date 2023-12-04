// icon:chevron-left | Bootstrap https://icons.getbootstrap.com/ | Bootstrap
import * as React from "react";

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            fill="currentColor"
            viewBox="0 0 16 16"
            height="1em"
            width="1em"
            {...props}
        >
            <path
                fillRule="evenodd"
                d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"
            />
        </svg>
    );
}

export default IconChevronLeft;
