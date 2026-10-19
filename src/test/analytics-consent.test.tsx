import {act, render, screen, waitFor, cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import AnalyticsConsent from '../components/AnalyticsConsent';
const mocks = vi.hoisted(() => ({fetchConsentRequirement:vi.fn(), privacySignal:vi.fn(), readConsent:vi.fn(), setConsent:vi.fn(), trackPage:vi.fn()}));
vi.mock('../utils/analytics', () => mocks);
vi.mock('react-i18next', () => ({useTranslation:()=>({i18n:{language:'en'}})}));
beforeEach(() => { vi.clearAllMocks(); mocks.privacySignal.mockReturnValue(false); mocks.readConsent.mockReturnValue(null); });
afterEach(cleanup);
const mount = () => render(<MemoryRouter><AnalyticsConsent /></MemoryRouter>);
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
});
