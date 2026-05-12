import * as React from "react";
import IconBase from "./IconBase";

function IconSpeedtest(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="currentColor"
        d="M12 3.5a9.5 9.5 0 0 0-8.7 13.3c.4.8 1.2 1.2 2 1.2h13.4c.8 0 1.6-.5 2-1.2A9.5 9.5 0 0 0 12 3.5m5.5 6.3-4.2 5a2.3 2.3 0 1 1-1.9-1.1l4.8-4.4c.8-.8 2 .4 1.3 1.2"
      />
    </IconBase>
  );
}

export default IconSpeedtest;
