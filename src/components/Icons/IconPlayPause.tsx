import * as React from "react";
import IconBase from "./IconBase";

function IconPause(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="currentColor"
        d="M6.2 5.2c0-.7.5-1.2 1.2-1.2h2.7c.7 0 1.2.5 1.2 1.2v13.6c0 .7-.5 1.2-1.2 1.2H7.4c-.7 0-1.2-.5-1.2-1.2zm6.5 0c0-.7.5-1.2 1.2-1.2h2.7c.7 0 1.2.5 1.2 1.2v13.6c0 .7-.5 1.2-1.2 1.2h-2.7c-.7 0-1.2-.5-1.2-1.2z"
      />
    </IconBase>
  );
}

export default IconPause;
