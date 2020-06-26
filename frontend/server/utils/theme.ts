export interface Theme {
  primary: string;
  text: string;
}

export const darkTheme: Theme = {
  primary: '#2a2d32',
  text: '#ffffff',
};

export const lightTheme: Theme = {
  primary: '#ffffff',
  text: '#000000',
};

// thanks alex <3
// Screen sizes for devices
const size = {
  mobileXS: '392px',
  mobileS: '488px',
  mobileL: '590px',
  tabletS: '730px',
  tabletM: '786px',
  tabletL: '960px',
  laptopS: '1172px',
  laptopM: '1442px',
};

// Media queries
export const device = {
  mobileXS: `(max-width: ${size.mobileXS})`,
  mobileS: `(max-width: ${size.mobileS})`,
  mobileL: `(max-width: ${size.mobileL})`,
  tabletS: `(max-width: ${size.tabletS})`,
  tabletM: `(max-width: ${size.tabletM})`,
  tabletL: `(max-width: ${size.tabletL})`,
  laptopS: `(max-width: ${size.laptopS})`,
  laptopM: `(max-width: ${size.laptopM})`,
};
