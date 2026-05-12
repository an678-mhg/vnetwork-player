import * as React from "react";
import IconBase from "./IconBase";

function IconVolumeMute(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="currentColor"
        d="M4.2 8.5c-.7 0-1.2.5-1.2 1.2v4.6c0 .7.5 1.2 1.2 1.2h3l4.3 3.8c.9.8 2.3.2 2.3-1V5.7c0-1.2-1.4-1.8-2.3-1L7.2 8.5zm13.2.2a1.2 1.2 0 0 0-1.7 1.7l1.6 1.6-1.6 1.6a1.2 1.2 0 0 0 1.7 1.7l1.6-1.6 1.6 1.6a1.2 1.2 0 0 0 1.7-1.7L20.7 12l1.6-1.6a1.2 1.2 0 0 0-1.7-1.7L19 10.3z"
      />
    </IconBase>
  );
}

export default IconVolumeMute;
