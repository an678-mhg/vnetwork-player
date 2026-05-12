import * as React from "react";
import IconBase from "./IconBase";

function IconFullscreen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.6}
        d="M4.5 9.5v-5h5m5 0h5v5m0 5v5h-5m-5 0h-5v-5"
      />
    </IconBase>
  );
}

export default IconFullscreen;
