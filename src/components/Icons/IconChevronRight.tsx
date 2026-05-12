import * as React from "react";
import IconBase from "./IconBase";

function IconChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="m8.2 5.2 6.8 6.8-6.8 6.8"
      />
    </IconBase>
  );
}

export default IconChevronRight;
