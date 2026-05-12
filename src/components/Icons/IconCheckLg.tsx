import * as React from "react";
import IconBase from "./IconBase";

function IconCheckLg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="m5.2 12.2 4.3 4.2 9.3-9.3"
      />
    </IconBase>
  );
}

export default IconCheckLg;
