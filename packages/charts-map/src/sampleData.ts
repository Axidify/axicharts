import type { Topology } from "topojson-specification";
import type { MapHierarchy } from "./mapDrill";

/** Minimal US hierarchy — regions → states → counties (CA/TX only). */
export const SAMPLE_US_TOPOLOGY: Topology = {
  type: "Topology",
  objects: {
    regions: {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Polygon",
          arcs: [[0]],
          id: "west",
          properties: { name: "West" },
        },
        {
          type: "Polygon",
          arcs: [[1]],
          id: "south",
          properties: { name: "South" },
        },
        {
          type: "Polygon",
          arcs: [[2]],
          id: "northeast",
          properties: { name: "Northeast" },
        },
      ],
    },
    states: {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Polygon",
          arcs: [[3]],
          id: "06",
          properties: { name: "California", region: "west" },
        },
        {
          type: "Polygon",
          arcs: [[4]],
          id: "48",
          properties: { name: "Texas", region: "south" },
        },
        {
          type: "Polygon",
          arcs: [[5]],
          id: "36",
          properties: { name: "New York", region: "northeast" },
        },
        {
          type: "Polygon",
          arcs: [[6]],
          id: "12",
          properties: { name: "Florida", region: "south" },
        },
        {
          type: "Polygon",
          arcs: [[7]],
          id: "53",
          properties: { name: "Washington", region: "west" },
        },
      ],
    },
    counties: {
      type: "GeometryCollection",
      geometries: [
        {
          type: "Polygon",
          arcs: [[8]],
          id: "la",
          properties: { name: "Los Angeles", state: "06" },
        },
        {
          type: "Polygon",
          arcs: [[9]],
          id: "sf",
          properties: { name: "San Francisco", state: "06" },
        },
        {
          type: "Polygon",
          arcs: [[10]],
          id: "harris",
          properties: { name: "Harris", state: "48" },
        },
        {
          type: "Polygon",
          arcs: [[11]],
          id: "dallas",
          properties: { name: "Dallas", state: "48" },
        },
      ],
    },
  },
  arcs: [
    [
      [-125, 40],
      [18, 0],
      [0, 8],
      [-18, 0],
      [0, -8],
    ],
    [
      [-106, 24],
      [16, 0],
      [0, 10],
      [-16, 0],
      [0, -10],
    ],
    [
      [-82, 38],
      [10, 0],
      [0, 8],
      [-10, 0],
      [0, -8],
    ],
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
    [
      [-118.5, 33.5],
      [4, 0],
      [0, 3],
      [-4, 0],
      [0, -3],
    ],
    [
      [-122.6, 37.5],
      [3, 0],
      [0, 2.5],
      [-3, 0],
      [0, -2.5],
    ],
    [
      [-95.5, 29.5],
      [4, 0],
      [0, 3],
      [-4, 0],
      [0, -3],
    ],
    [
      [-96.9, 32.5],
      [3.5, 0],
      [0, 2.5],
      [-3.5, 0],
      [0, -2.5],
    ],
  ],
};

export const SAMPLE_US_HIERARCHY: MapHierarchy = {
  levels: [
    { objectKey: "regions", featureId: "id", nameKey: "name" },
    {
      objectKey: "states",
      featureId: "id",
      nameKey: "name",
      parentIdKey: "region",
    },
    {
      objectKey: "counties",
      featureId: "id",
      nameKey: "name",
      parentIdKey: "state",
    },
  ],
};

export const SAMPLE_REGION_VALUES: Record<string, number> = {
  west: 65,
  south: 61,
  northeast: 91,
};

export const SAMPLE_US_VALUES: Record<string, number> = {
  "06": 82,
  "48": 64,
  "36": 91,
  "12": 58,
  "53": 47,
};

export const SAMPLE_COUNTY_VALUES: Record<string, number> = {
  la: 95,
  sf: 78,
  harris: 70,
  dallas: 58,
};

export const SAMPLE_DRILL_VALUES: Record<string, number> = {
  ...SAMPLE_REGION_VALUES,
  ...SAMPLE_US_VALUES,
  ...SAMPLE_COUNTY_VALUES,
};
