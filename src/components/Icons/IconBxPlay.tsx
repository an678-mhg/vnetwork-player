import * as React from "react";
import IconBase from "./IconBase";

function IconPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="currentColor"
        d="M8 5.9c0-1.2 1.4-2 2.5-1.3l8.8 5.9c1 .7 1 2.1 0 2.8l-8.8 5.9C9.4 20 8 19.2 8 18z"
      />
    </IconBase>
  );
}

export default IconPlay;
