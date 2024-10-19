import React, { useState } from 'react';
import { useQuery, useMutation, QueryClient } from 'react-query';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ReactMarkdown from 'react-markdown';
import './Blog.scss';

interface Post {
  id: string;
  userId: string;
  title: string;
  content: string; // Markdown content
  createdAt: { seconds: number; nanoseconds: number };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Blog = () => {
  const [postText, setPostText] = useState('');
  const [postTitle, setPostTitle] = useState('');

  const { data: authData, isLoading: authLoading } = useQuery('authStatus', async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/session`, { credentials: 'include' });
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
    const querySnapshot = await getDocs(collection(db, 'posts'));
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Post))
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  };

  const { data: posts, isLoading: postsLoading } = useQuery('posts', fetchPosts);

  const addPostMutation = useMutation(
    (newPost: Omit<Post, 'id'>) => addDoc(collection(db, 'posts'), newPost),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('posts');
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
        userId: authData?.user?.id || 0,
        title: postTitle,
        content: postText,
        createdAt: Timestamp.fromDate(new Date()),
      });
      setPostText('');
      setPostTitle('');
    }
  };

  return (
    <div className="blog">
      <h1>Blog</h1>
      {authLoading ? (
        <div className={'loading-ring'}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : authData ? (
        <form onSubmit={handlePostSubmit}>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Enter a title"
          />
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Write a post..."
            rows={5}
            style={{ resize: 'vertical', color: 'black' }}
          />
          <button type="submit">Post</button>
        </form>
      ) : (
        <div className="not-logged-in">
          <p>Please log in to post.</p>
        </div>
      )}
      {postsLoading ? (
        <div className="profile">
          <div className={'loading-ring'}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      ) : (
        posts && posts.map(post => (
          <div key={post.id} className="post">
            <h2>{post.title}</h2>
            <ReactMarkdown>{post.content}</ReactMarkdown>
            <span className="profile-post-date">{new Date(post.createdAt.seconds * 1000).toLocaleString()}</span>
            {posts.indexOf(post) !== posts.length - 1 && <hr />}
          </div>
        ))
      )}
    </div>
  );
};

export default Blog;