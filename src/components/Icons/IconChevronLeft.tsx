import * as React from "react";
import IconBase from "./IconBase";

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="m15.8 5.2-6.8 6.8 6.8 6.8"
      />
    </IconBase>
  );
}

export default IconChevronLeft;
