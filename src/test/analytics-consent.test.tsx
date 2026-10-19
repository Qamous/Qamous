import {act, render, screen, waitFor, cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import AnalyticsConsent from '../components/AnalyticsConsent';
import Footer from '../components/Footer';
const mocks = vi.hoisted(() => ({fetchConsentRequirement:vi.fn(), privacySignal:vi.fn(), readConsent:vi.fn(), setConsent:vi.fn(), trackPage:vi.fn()}));
vi.mock('../utils/analytics', () => mocks);
vi.mock('react-i18next', () => ({useTranslation:()=>({i18n:{language:'en'},t:(key:string)=>key})}));
beforeEach(() => {
  vi.clearAllMocks(); mocks.privacySignal.mockReturnValue(false); mocks.readConsent.mockReturnValue(null);
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open',''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
afterEach(cleanup);
const mount = () => render(<MemoryRouter><Footer /><AnalyticsConsent /></MemoryRouter>);
describe('regional consent UI', () => {
  it('waits for the edge policy before starting measurement', async () => {
    let resolve!: (value:boolean)=>void;
    mocks.fetchConsentRequirement.mockReturnValue(new Promise<boolean>(r => {resolve=r;}));
    mount();
    expect(mocks.trackPage).not.toHaveBeenCalled();
    await act(async()=>resolve(false));
    expect(mocks.trackPage).toHaveBeenLastCalledWith('/',true);
    expect(screen.queryByRole('region',{name:'Optional analytics cookies'})).toBeNull();
  });
  it('asks visitors in consent regions before enabling tracking', async () => {
    mocks.fetchConsentRequirement.mockResolvedValue(true);
    mount();
    expect(await screen.findByRole('region',{name:'Optional analytics cookies'})).toBeInTheDocument();
    expect(mocks.trackPage).toHaveBeenLastCalledWith('/',false);
    await act(async()=>screen.getByRole('button',{name:'Allow analytics'}).click());
    expect(mocks.trackPage).toHaveBeenLastCalledWith('/',true);
  });
  it('does not override an existing opt-out outside consent regions', async () => {
    mocks.readConsent.mockReturnValue('denied'); mocks.fetchConsentRequirement.mockResolvedValue(false);
    mount();
    await waitFor(()=>expect(mocks.trackPage).toHaveBeenLastCalledWith('/',false));
    expect(screen.queryByRole('region',{name:'Optional analytics cookies'})).toBeNull();
  });
  it('keeps a privacy control available without automatically opening a prompt', async () => {
    mocks.fetchConsentRequirement.mockResolvedValue(false);
    mount();
    await waitFor(()=>expect(mocks.trackPage).toHaveBeenCalled());
    await act(async()=>screen.getByRole('button',{name:'Privacy'}).click());
    await act(async()=>screen.getByRole('button',{name:'No thanks'}).click());
    expect(mocks.setConsent).toHaveBeenCalledWith('denied');
    expect(mocks.trackPage).toHaveBeenLastCalledWith('/',false);
  });
  it('places the privacy control inside the footer, not in a floating overlay', async () => {
    mocks.fetchConsentRequirement.mockResolvedValue(false);
    mount();
    await waitFor(()=>expect(mocks.trackPage).toHaveBeenCalled());
    expect(screen.getByRole('button',{name:'Privacy'}).closest('footer')).not.toBeNull();
    expect(document.querySelector('.analytics-settings')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('shows a clear protection message and working Done button instead of a disabled Allow button', async () => {
    mocks.fetchConsentRequirement.mockResolvedValue(false); mocks.privacySignal.mockReturnValue(true); mocks.readConsent.mockReturnValue('denied');
    mount();
    await act(async()=>screen.getByRole('button',{name:'Privacy'}).click());
    expect(screen.getByRole('status')).toHaveTextContent('Tracking protection is on');
    expect(screen.queryByRole('button',{name:'Allow analytics'})).toBeNull();
    await act(async()=>screen.getByRole('button',{name:'Done'}).click());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.setConsent).toHaveBeenCalledWith('denied');
  });
  it('does not reopen the dialog when a slow policy resolves after choosing Allow', async () => {
    let resolve!: (value:boolean)=>void;
    mocks.fetchConsentRequirement.mockReturnValue(new Promise<boolean>(r => {resolve=r;}));
    mount();
    await act(async()=>screen.getByRole('button',{name:'Privacy'}).click());
    await act(async()=>screen.getByRole('button',{name:'Allow analytics'}).click());
    await act(async()=>resolve(true));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.trackPage).toHaveBeenLastCalledWith('/',true);
  });
  it('closes privacy settings without changing the consent choice', async () => {
    mocks.fetchConsentRequirement.mockResolvedValue(false); mount();
    await act(async()=>screen.getByRole('button',{name:'Privacy'}).click());
    await act(async()=>screen.getByRole('button',{name:'Close privacy settings'}).click());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.setConsent).not.toHaveBeenCalled();
  });
});
