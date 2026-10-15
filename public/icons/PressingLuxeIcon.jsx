import React from "react";

export function PressingLuxeIcon({
  name,
  size = 24,
  strokeWidth = 1.55,
  className = "",
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#111111"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <use href={`/icons/pressing-luxe-sprite.svg#icon-${name}`} />
    </svg>
  );
}
