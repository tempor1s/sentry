import styled from 'styled-components';
import { device } from '../utils/theme';

const Container = styled.div`
  width: 1375px;
  margin: 0px auto;
  @media ${device.laptopM} {
    width: 1105px;
  }
  @media ${device.laptopS} {
    width: 905px;
  }
  @media ${device.tabletM} {
    width: 726px;
  }
  @media ${device.tabletL} {
    width: 90%;
  }
`;

export default Container;
