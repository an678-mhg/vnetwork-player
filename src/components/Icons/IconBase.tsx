import * as React from "react";

type IconBaseProps = React.SVGProps<SVGSVGElement> & {
  children: React.ReactNode;
};

function IconBase({ children, ...props }: IconBaseProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      height="1em"
      width="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export default IconBase;
