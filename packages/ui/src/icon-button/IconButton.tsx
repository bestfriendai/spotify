import { MouseEventHandler, ReactNode, useState } from "react";

export const IconButton = ({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      className={`iconButton ${hover ? "hover" : ""}`}
      onClick={onClick}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      title={title}
    >
      {icon}
    </button>
  );
};
