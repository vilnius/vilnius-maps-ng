export const Symbols: any = {
  pointSymbol: {
    type: "simple-marker", // autocasts as SimpleMarkerSymbol
    style: "circle",
    //color: "red",
    size: "10px",
    outline: { // autocasts as SimpleLineSymbol
      color: [193, 39, 45],
      width: 2
    }
  },
  lineSymbol: {
    type: "simple-line", // autocasts as SimpleLineSymbol
    color: [193, 39, 45],
    width: 2,
    cap: "round",
    join: "round"
  },
  polygonSymbol: {
    type: "simple-fill", // autocasts as SimpleFillSymbol
    //color: [178, 102, 234],
    style: "solid",
    outline: { // autocasts as SimpleLineSymbol
      color: [193, 39, 45],
      width: 2
    }
  },
  bufferSymbol: {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: [0, 0, 0, 0.4],
    outline: { // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 1
    }
  },
  selectionPolygon: {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: [0, 0, 0, 0.2],
    outline: { // autocasts as new SimpleLineSymbol()
      color: [193, 39, 45],
      width: 2
    }
  },
  selectionLine: {
    type: "simple-line", // autocasts as SimpleLineSymbol
    color: [193, 39, 45],
    width: 2,
    cap: "round",
    join: "round"
  },
  selectionPoint: {
    type: "simple-marker", // autocasts as SimpleMarkerSymbol
    style: "circle",
    color: [193, 39, 45, 0],
    size: "24px",
    outline: { // autocasts as SimpleLineSymbol
      color: [193, 39, 45],
      width: 2//,
      //style: "short-dash"
    }
  }
};
