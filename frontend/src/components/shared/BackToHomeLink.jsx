import React from "react";
import { Link } from "react-router-dom";

const BackToHomeLink = () => (
  <Link
    to="/"
    className="flex items-center gap-1 text-teal-600 hover:text-teal-800 transition mb-4 text-sm font-medium"
    style={{ alignSelf: "flex-start", marginLeft: "max(0px,calc(50vw - 200px))" }}
    tabIndex={0}
  >
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    Back to Home
  </Link>
);

export default BackToHomeLink;
