import React from 'react';
import {render as baseRender, type RenderOptions} from '@testing-library/react';
import {HelmetProvider} from 'react-helmet-async';
export * from '@testing-library/react';
export function render(ui: React.ReactNode, options: RenderOptions = {}) {
  const Wrapper = options.wrapper ?? React.Fragment;
  return baseRender(ui, {...options, wrapper: ({children}) => <HelmetProvider><Wrapper>{children}</Wrapper></HelmetProvider>});
}
