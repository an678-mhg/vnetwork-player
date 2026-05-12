import * as React from "react";
import IconBase from "./IconBase";

function IconVolumeHigh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="currentColor"
        d="M4.2 8.5c-.7 0-1.2.5-1.2 1.2v4.6c0 .7.5 1.2 1.2 1.2h3l4.3 3.8c.9.8 2.3.2 2.3-1V5.7c0-1.2-1.4-1.8-2.3-1L7.2 8.5zM16.5 7.1a1.1 1.1 0 0 0-.2 1.5 5.3 5.3 0 0 1 0 6.8 1.1 1.1 0 0 0 .2 1.5c.5.4 1.2.3 1.6-.2a7.6 7.6 0 0 0 0-9.4 1.1 1.1 0 0 0-1.6-.2m3.2-2.4a1.1 1.1 0 0 0-.2 1.5 9.5 9.5 0 0 1 0 11.6 1.1 1.1 0 0 0 .2 1.5c.5.4 1.2.3 1.6-.2a11.8 11.8 0 0 0 0-14.2 1.1 1.1 0 0 0-1.6-.2"
      />
    </IconBase>
  );
}

export default IconVolumeHigh;
