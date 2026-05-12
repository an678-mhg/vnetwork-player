import * as React from "react";
import IconBase from "./IconBase";

function IconSubtitles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.8 5h14.4C20.7 5 22 6.3 22 7.8v8.4c0 1.5-1.3 2.8-2.8 2.8H4.8A2.8 2.8 0 0 1 2 16.2V7.8C2 6.3 3.3 5 4.8 5M7.6 11.2h2.8a1.1 1.1 0 1 0 0-2.2H7.6A2.6 2.6 0 0 0 5 11.6v.8A2.6 2.6 0 0 0 7.6 15h2.8a1.1 1.1 0 1 0 0-2.2H7.6a.4.4 0 0 1-.4-.4v-.8c0-.2.2-.4.4-.4m7.2 0h2.6a1.1 1.1 0 1 0 0-2.2h-2.6a2.6 2.6 0 0 0-2.6 2.6v.8a2.6 2.6 0 0 0 2.6 2.6h2.6a1.1 1.1 0 1 0 0-2.2h-2.6a.4.4 0 0 1-.4-.4v-.8c0-.2.2-.4.4-.4"
      />
    </IconBase>
  );
}

export default IconSubtitles;
