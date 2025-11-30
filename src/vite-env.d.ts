/// <reference types="vite/client" />

// Declare CSV module types
declare module '*.csv?raw' {
  const content: string;
  export default content;
}

declare module '*.csv' {
  const content: string;
  export default content;
}
