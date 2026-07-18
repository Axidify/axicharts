import type { Topology } from "topojson-specification";

/** Minimal US states TopoJSON — California, Texas, New York, Florida, Washington. */
export const SAMPLE_US_TOPOLOGY: Topology = {
  type: "Topology",
  objects: {
    states: {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Polygon",
          arcs: [[0]],
          id: "06",
          properties: { name: "California" },
        },
        {
          type: "Polygon",
          arcs: [[1]],
          id: "48",
          properties: { name: "Texas" },
        },
        {
          type: "Polygon",
          arcs: [[2]],
          id: "36",
          properties: { name: "New York" },
        },
        {
          type: "Polygon",
          arcs: [[3]],
          id: "12",
          properties: { name: "Florida" },
        },
        {
          type: "Polygon",
          arcs: [[4]],
          id: "53",
          properties: { name: "Washington" },
        },
      ],
    },
  },
  arcs: [
    [
      [-124, 32],
      [10, 0],
      [0, 10],
      [-10, 0],
      [0, -10],
    ],
    [
      [-106, 25],
      [12, 0],
      [0, 12],
      [-12, 0],
      [0, -12],
    ],
    [
      [-79, 40],
      [8, 0],
      [0, 6],
      [-8, 0],
      [0, -6],
    ],
    [
      [-87, 24],
      [8, 0],
      [0, 7],
      [-8, 0],
      [0, -7],
    ],
    [
      [-124, 46],
      [8, 0],
      [0, 5],
      [-8, 0],
      [0, -5],
    ],
  ],
};

export const SAMPLE_US_VALUES: Record<string, number> = {
  "06": 82,
  "48": 64,
  "36": 91,
  "12": 58,
  "53": 47,
};
