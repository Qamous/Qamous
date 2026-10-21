declare module 'qamous:ssr' {
  export type RenderSeed = import('../server/contracts').RenderSeed;
  export const renderApplication: (request:Request, fetchData:import('../server/contracts').FetchData, seed?:RenderSeed) => Promise<import('../server/contracts').RenderedApplication>;
}
