export const BASEMAPS: any[] = [
  {
    id: "base-dark",
    name: "Tamsus",
    serviceName: "basemapDarkUrl" //based on Options.ts
  },
  {
    id: "base-orto",
    name: "Ortofoto",
    serviceName: "ortofotoUrl"//based on Options.ts
  },
  {
    id: "base-map",
    name: "Žemėlapis",
    serviceName: "basemapUrl" //based on Options.ts
  },
  {
    id: "base-en-t",
    name: "Inžinerija / T", //engineering plus base-dark
    serviceName: "basemapEngineeringUrl" //based on Options.ts
  },
  {
    id: "base-en-s",
    name: "Inžinerija / Ž", // engineering plus base-map
    serviceName: "basemapEngineeringUrl" //based on Options.ts
  }
];

export class Basemap {
	id: string;
	name: string;
	serviceName: string;
}
