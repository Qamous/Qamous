import {act, fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {afterEach, describe, expect, it, vi} from 'vitest';
import Footer from '../components/Footer';
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));
afterEach(()=>vi.unstubAllGlobals());
const mount=()=>render(<MemoryRouter><Footer /></MemoryRouter>);
describe('responsive footer controls',()=>{
  it('starts collapsed on phones even at the bottom and provides a real expand/collapse button',()=>{
    vi.stubGlobal('innerWidth',390);mount();
    const toggle=screen.getByRole('button',{name:'Expand footer'});
    expect(toggle).toHaveTextContent('');
    expect(toggle.querySelector('svg')).not.toBeNull();
    expect(toggle).toHaveAttribute('aria-expanded','false');
    expect(screen.queryByRole('button',{name:'Privacy'})).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByRole('button',{name:'Collapse footer'})).toHaveAttribute('aria-expanded','true');
    expect(toggle).toHaveTextContent('');
    expect(screen.getByRole('button',{name:'Privacy'})).toHaveAttribute('tabindex','0');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded','false');
  });
  it('preserves manual choices through scrolling and resizing',()=>{
    vi.stubGlobal('innerWidth',390);mount();
    const toggle=screen.getByRole('button',{name:'Expand footer'});
    fireEvent.click(toggle);
    act(()=>{window.dispatchEvent(new Event('scroll'));window.dispatchEvent(new Event('resize'));});
    expect(toggle).toHaveAttribute('aria-expanded','true');
    fireEvent.click(toggle);
    act(()=>window.dispatchEvent(new Event('scroll')));
    expect(toggle).toHaveAttribute('aria-expanded','false');
  });
  it('retains desktop bottom-of-page expansion and labels social links',()=>{
    vi.stubGlobal('innerWidth',1280);mount();
    expect(screen.getByRole('button',{name:'Collapse footer'})).toHaveAttribute('aria-expanded','true');
    for(const name of ['Facebook','Instagram','GitHub','Email Qamous','Support Qamous']) expect(screen.getByRole('link',{name})).toBeInTheDocument();
  });
});
