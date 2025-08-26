import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

 export const hp = (percentage: number) => {
  const value = (percentage * height) / 100;
  return Math.round(value);
}
 export const wp = (percentage: number) => {
  const value = (percentage * width) / 100;
  return Math.round(value);
}