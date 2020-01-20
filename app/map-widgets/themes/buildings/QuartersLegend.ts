export interface IQuartersLegend {
  border?: IColor;
  [name: string]: IColor;
}

export interface IColor {
  color: string;
}

export const QuartersLegend: IQuartersLegend = {
  border: {
    color: '#1a57be'
  },
  'group1': {
    color: '#63a7f8'
  },
  'group2': {
    color: '#cbe8f9'
  },
  'group3': {
    color: 'none'
  }
}
