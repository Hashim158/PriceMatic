import * as React from "react";
import Svg, { Rect } from "react-native-svg";

const More = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Rect
      x="18"
      y="10.5"
      width="3"
      height="3"
      rx="1"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 1.5}
    />
    <Rect
      x="10.5"
      y="10.5"
      width="3"
      height="3"
      rx="1"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 1.5}
    />
    <Rect
      x="3"
      y="10.5"
      width="3"
      height="3"
      rx="1"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 1.5}
    />
  </Svg>
);

export default More;
