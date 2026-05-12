import * as React from "react";
import IconBase from "./IconBase";

function IconQualityHigh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.7 4.5h14.6c1 0 1.7.8 1.7 1.7v11.6c0 1-.8 1.7-1.7 1.7H4.7c-1 0-1.7-.8-1.7-1.7V6.2c0-1 .8-1.7 1.7-1.7m2.5 4.2c-.7 0-1.2.5-1.2 1.2v4.2c0 .7.5 1.2 1.2 1.2s1.2-.5 1.2-1.2V13h2.4v1.1c0 .7.5 1.2 1.2 1.2s1.2-.5 1.2-1.2V9.9c0-.7-.5-1.2-1.2-1.2s-1.2.5-1.2 1.2V11H8.4V9.9c0-.7-.5-1.2-1.2-1.2m8.9 0c-.7 0-1.2.5-1.2 1.2v4.2c0 .7.5 1.2 1.2 1.2h1c1.8 0 3-1.3 3-3.3s-1.2-3.3-3-3.3zm1.2 2.2c.3 0 .5.4.5 1.1s-.2 1.1-.5 1.1h-.1v-2.2z"
      />
    </IconBase>
  );
}

export default IconQualityHigh;
