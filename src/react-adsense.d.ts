declare module 'react-adsense' {
  import * as React from 'react';
  
  interface GoogleAdSenseProps {
    client: string;
    slot: string;
    style?: React.CSSProperties;
    format?: string;
    responsive?: string;
  }
  
  class Google extends React.Component<GoogleAdSenseProps> {}
  
  export { Google };
}