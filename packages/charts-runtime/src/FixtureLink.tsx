"use client";

import type { ReactElement } from "react";

export function FixtureLink({ href }: { href: string }): ReactElement {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ fontSize: 10, color: "#93c5fd", textDecoration: "none" }}
    >
      Fixture
    </a>
  );
}
