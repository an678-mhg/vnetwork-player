import * as React from "react";
import IconBase from "./IconBase";

function IconPictureInPictureFill(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.8 4h14.4C20.7 4 22 5.3 22 6.8v10.4c0 1.5-1.3 2.8-2.8 2.8H4.8A2.8 2.8 0 0 1 2 17.2V6.8C2 5.3 3.3 4 4.8 4m1 3.2c-.3 0-.6.3-.6.6v8.4c0 .3.3.6.6.6h5.9v-4.6c0-1.3 1-2.3 2.3-2.3h5.8V7.8c0-.3-.3-.6-.6-.6zm8.1 9.7h5.2c.4 0 .7-.3.7-.7v-3.9h-5.2c-.4 0-.7.3-.7.7z"
      />
    </IconBase>
  );
}

export default IconPictureInPictureFill;
