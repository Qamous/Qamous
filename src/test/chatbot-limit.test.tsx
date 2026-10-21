import {afterEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {QueryClient,QueryClientProvider} from 'react-query';
import Chatbot from '../../pages/Chatbot';
import Login from '../../pages/LogIn';

vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key,i18n:{language:'en'}})}));

afterEach(()=>vi.unstubAllGlobals());

it('shows a sign-in action when a verified guest reaches the chat limit',async()=>{
  vi.stubGlobal('turnstile',{
    render:(_host:HTMLElement,options:{callback:(token:string)=>void})=>{
      queueMicrotask(()=>options.callback('test-token'));
      return 'widget-1';
    },
    reset:vi.fn(),remove:vi.fn(),
  });
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({
    statusCode:429,message:'Guest chat limit reached. Sign in to keep chatting.',code:'GUEST_CHAT_LIMIT',
  }),{status:429})));
  Element.prototype.scrollIntoView=vi.fn();
  render(<MemoryRouter><QueryClientProvider client={new QueryClient()}><Chatbot /></QueryClientProvider></MemoryRouter>);
  const send=screen.getByRole('button',{name:'chatbot.send'});
  await waitFor(()=>expect(send).toBeEnabled());
  fireEvent.change(screen.getByPlaceholderText('chatbot.input_placeholder'),{target:{value:'hello'}});
  fireEvent.click(send);
  const link=await screen.findByRole('link',{name:'chatbot.sign_in_to_continue'});
  expect(link).toHaveAttribute('href','/login');
  expect(screen.getByText('chatbot.guest_limit')).toBeVisible();
  expect(send).toBeDisabled();
  expect(fetch).toHaveBeenCalledWith('/api/rag',expect.objectContaining({credentials:'include'}));
});

it('returns to the chatbot after signing in through its prompt',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({id:1,username:'chat-test'})));
  render(<MemoryRouter initialEntries={[{pathname:'/login',state:{returnTo:'/chatbot'}}]}>
    <QueryClientProvider client={new QueryClient()}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/chatbot" element={<p>Chat resumed</p>} />
      </Routes>
    </QueryClientProvider>
  </MemoryRouter>);
  fireEvent.change(screen.getByPlaceholderText('login.enter_username'),{target:{value:'chat-test'}});
  fireEvent.change(screen.getByPlaceholderText('login.enter_password'),{target:{value:'test-password'}});
  fireEvent.click(screen.getByRole('button',{name:'login.login'}));
  fireEvent.click(await screen.findByRole('button',{name:'common.ok'}));
  expect(await screen.findByText('Chat resumed')).toBeVisible();
});
