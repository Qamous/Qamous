import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_URL, apiJson } from '../src/api';
import ReactMarkdown from 'react-markdown';
import './Blog.scss';
import { useTranslation } from 'react-i18next';
import Helmet from '../src/components/PageMetadata';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { blogCopy, blogGuides } from '../src/content/blog-guides';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  userId: string;
  title: string;
  content: string; // Markdown content
  createdAt: { seconds: number; nanoseconds: number };
}

const Blog = () => {
  const queryClient = useQueryClient();
  const [postText, setPostText] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const { t, i18n } = useTranslation();
  const language = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const isRtl = language === 'ar';
  const copy = blogCopy[language];
  
  const { data: authData, isLoading: authLoading } = useQuery('authStatus', async () => {
    const response = await fetch(`${API_URL}/auth/session`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Not logged in');
    }
    const { session, sessionId } = await response.json();
    if (session && sessionId && session.passport) {
      const { user } = session.passport;
      if (user) {
        return user;
      }
    }
  });
  
  const fetchPosts = async (): Promise<Post[]> => {
    return apiJson<Post[]>(await fetch(`${API_URL}/posts`));
  };
  
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery<Post[], Error>('posts', fetchPosts);
  
  const addPostMutation = useMutation(
    async (newPost: Pick<Post, 'title' | 'content'>) => apiJson<Post>(await fetch(`${API_URL}/posts`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPost),
    })),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
        setPostText('');
        setPostTitle('');
        setIsPreviewing(false);
      },
      onError: (error) => {
        console.error('Error adding post:', error);
      },
    },
  );
  
  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (postText.trim() && postTitle.trim()) {
      addPostMutation.mutate({
        title: postTitle,
        content: postText,
      });
    }
  };
  
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    
    // Format for English
    if (i18n.language === 'en') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour12: true
      }).format(date);
    }
    
    // Format for Arabic
    if (i18n.language === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour12: true
      }).format(date);
    }
    
    // Default format
    return date.toLocaleString();
  };
  
  // Preview toggle handler
  const togglePreview = () => {
    setIsPreviewing(!isPreviewing);
  };
  
  return (
    <div className="blog" lang={language} dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{copy.title} | Qamous</title>
        <meta name="description" content={copy.description} />
        <meta property="og:title" content={`${copy.title} | Qamous`} />
        <meta property="og:description" content={copy.description} />
        <meta name="twitter:title" content={`${copy.title} | Qamous`} />
        <meta name="twitter:description" content={copy.description} />
      </Helmet>
      <h1>{copy.title}</h1>
      <p className="blog-intro">{copy.intro}</p>
      <section className="posts blog-guides" aria-label={copy.title}>
        {blogGuides.map((guide) => {
          const article = guide[language];
          return <article key={guide.id} id={guide.id} className="post">
            <header className="post-header"><h2>{article.title}</h2></header>
            <div className="post-content">
              {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <ul className="guide-links">
                {article.links.map((link) => <li key={link.href}><Link to={link.href}>{link.label}</Link></li>)}
              </ul>
            </div>
          </article>;
        })}
      </section>
      <h2>{copy.community}</h2>
      {authLoading ? (
        <LoadingSpinner />
      ) : authData ? (
        <form method="post" onSubmit={handlePostSubmit}>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder={t('blog.enter_title')}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
          {!isPreviewing ? (
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={t('blog.enter_content')}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
          ) : (
            <div className="preview-container">
              <h2>{postTitle}</h2>
              <div className="post-content">
                <ReactMarkdown>{postText}</ReactMarkdown>
              </div>
            </div>
          )}
          <div className="form-buttons">
            <button
              type="button"
              onClick={togglePreview}
              className={`preview-button ${!postText.trim() || !postTitle.trim() ? 'disabled' : ''}`}
              disabled={!postText.trim() || !postTitle.trim()}
            >
              {isPreviewing ? t('blog.edit') : t('blog.preview')}
            </button>
            <button
              type="submit"
              disabled={!postTitle.trim() || !postText.trim() || addPostMutation.isLoading}
            >
              {t('blog.post')}
            </button>
          </div>
          {addPostMutation.isError && <p role="alert">{(addPostMutation.error as Error).message}</p>}
          <small style={{ textAlign: isRtl ? 'right' : 'left', display: 'block' }}>
            <a
              href="https://www.markdownguide.org/basic-syntax/"
              target="_blank"
              rel="noopener noreferrer"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {t('blog.markdown_guide')}
            </a>
          </small>
        </form>
      ) : (
        <div className="login-message">
          <p dangerouslySetInnerHTML={{ __html: t('blog.please_log_in_to_post') }}></p>
        </div>
      )}
      <div className="posts">
        {postsError && <p role="alert">{postsError.message}</p>}
        {postsLoading ? (
          <LoadingSpinner />
        ) : (
          posts?.map((post) => (
            <article key={post.id} className="post">
              <header className="post-header">
                <h2>{post.title}</h2>
                <small dir={isRtl ? 'rtl' : 'ltr'} className="post-date">
                  {formatDate(post.createdAt)}
                </small>
              </header>
              <div className="post-content">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Blog;
