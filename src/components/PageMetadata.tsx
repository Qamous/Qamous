import React, {Children, isValidElement, type ReactElement, type ReactNode} from 'react';
import {Helmet} from 'react-helmet-async';

// Page titles and snippets also describe shared links, using one source of copy.
export default function PageMetadata({children}: {children:ReactNode}) {
  const tags=Children.toArray(children).filter(isValidElement) as ReactElement<{name?:string;content?:string;children?:ReactNode}>[];
  const titleNodes=tags.find(tag=>tag.type==='title')?.props.children;
  const title=titleNodes?Children.toArray(titleNodes).filter(node=>typeof node==='string'||typeof node==='number').join(''):undefined;
  const description=tags.find(tag=>tag.type==='meta'&&tag.props.name==='description')?.props.content;
  return <Helmet>{children}
    {typeof title==='string'&&<meta property="og:title" content={title}/>}
    {typeof title==='string'&&<meta name="twitter:title" content={title}/>}
    {description&&<meta property="og:description" content={description}/>}
    {description&&<meta name="twitter:description" content={description}/>}
  </Helmet>;
}
