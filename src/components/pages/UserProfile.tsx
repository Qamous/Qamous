import React, { useEffect, useState } from 'react';
import './UserProfile.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowRightFromBracket,
  faFlag,
  faThumbsDown,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';
import { useMutation } from 'react-query';
import CustomDialog from '../CustomDialog';

//import { ReactComponent as ArrowForwardIcon } from '../../assets/arrow_forward.svg';

interface Word {
  id: number;
  userId: number;
  arabicWord: string;
  francoArabicWord: string;
  createdAt: string;
  reportCount: number;
}

interface Definition {
  id: number;
  wordId: number;
  userId: number;
  countryCode: string;
  definition: string;
  example: string;
  isArabic: boolean;
  AddedTimestamp: string;
  likeCount: number;
  dislikeCount: number;
  reportCount: number;
  word: Word;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [editedText, setEditedText] = useState('');
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submittingPostId, setSubmittingPostId] = useState<number | null>(null);
  const [isInvalidInput, setIsInvalidInput] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<{ [key: number]: 'ARABIC' | 'FRANCO-ARABIC' }>({});
  const [uniqueWords, setUniqueWords] = useState<Word[]>([]);
  const [wordDefinitions, setWordDefinitions] = useState<{ [key: number]: Definition[] }>({});
  
  const handlePostLanguageClick = (postId: number) => {
    setCurrentLanguage(prevState => ({
      ...prevState,
      [postId]: prevState[postId] === 'ARABIC' ? 'FRANCO-ARABIC' : 'ARABIC',
    }));
  };
  
  const logoutMutation = useMutation(() =>
      fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }),
    {
      onSuccess: () => {
        // Redirect to login page after successful logout
        navigate('/login');
      },
    },
  );
  
  const handleLogout = (): void => {
    logoutMutation.mutate();
  };
  
  const handleEditClick = (postId: number, definitionText: string): void => {
    if (editingPostId !== postId) {
      setEditingPostId(postId);
      setEditedText(definitionText);
    } else {
      if (editedText.trim() === '') {
        setIsInvalidInput(true);
        setIsDialogOpen(true);
      } else {
        setIsInvalidInput(false); // Reset isInvalidInput to false
        setSubmittingPostId(postId);
        setIsDialogOpen(true);
      }
    }
  };
  
  const handleDialogSubmitEdit = (): void => {
    if (submittingPostId !== null) {
      const updatedDefinition = definitions.find(def => def.id === submittingPostId);
      if (updatedDefinition) {
        updatedDefinition.definition = editedText;
        fetch(`http://localhost:3000/definitions/${submittingPostId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedDefinition),
        })
          .then(response => response.json())
          .then(data => {
            setDefinitions(definitions.map(def => {
              if (def.id === submittingPostId) {
                return { ...def, definition: editedText };
              }
              return def;
            }));
            setEditingPostId(null);
            setSubmittingPostId(null);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
      setIsDialogOpen(false);
    }
  };
  
  const handleDialogCloseEdit = (): void => {
    setIsDialogOpen(false);
    setEditingPostId(null);
  };
  
  const rearrangeDefinitions = (definitions: Definition[]) => {
    const wordDefinitions: { [key: number]: Definition[] } = {};
    const uniqueWords: { [key: number]: Word } = {};
    
    definitions.forEach((definition) => {
      const wordId = definition.word.id;
      
      if (!wordDefinitions[wordId]) {
        wordDefinitions[wordId] = [];
      }
      
      if (!uniqueWords[wordId]) {
        uniqueWords[wordId] = definition.word;
      }
      
      wordDefinitions[wordId].push(definition);
    });
    
    return [wordDefinitions, Object.values(uniqueWords)];
  };
  
  // Redirect to /profile if the user is on /signup or /login
  useEffect(() => {
    if (location.pathname !== '/profile') {
      navigate('/profile');
    }
  }, [location, navigate]);
  
  useEffect(() => {
    const userId = 1; // Replace with the actual user ID
    
    fetch(`http://localhost:3000/definitions/user/${userId}`)
      .then(response => response.json())
      .then(data => {
        setDefinitions(data);
        
        const [wordDefinitionsData, uniqueWordsData] = rearrangeDefinitions(data);
        setWordDefinitions(wordDefinitionsData as { [key: number]: Definition[] });
        setUniqueWords(uniqueWordsData as Word[]);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    
    // Allow Esc to cancel editing
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEditingPostId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Remove event listener on cleanup
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return (
    <div className="profile">
      {isDialogOpen && (
        isInvalidInput ? (
          <CustomDialog
            text={
              <p><strong>Edit unsuccessful:</strong> The definition cannot be left empty.</p>
            }
            okButtonText="OK"
            onOkButtonClick={handleDialogCloseEdit}
            onClose={handleDialogCloseEdit}
          />
        ) : (
          <CustomDialog
            text="Are you sure you want to submit your changes?"
            buttonText1="Confirm"
            onButton1Click={handleDialogSubmitEdit}
            buttonText2="Cancel"
            onButton2Click={handleDialogCloseEdit}
            onClose={handleDialogCloseEdit}
          />
        )
      )}
      {/*<h1 className="profile-primary">Qamous<span className="profile-primary-secondary">,</span></h1>*/}
      {/*<h1 className="profile-secondary">a dictionary written</h1>*/}
      {/*<h1 className="profile-secondary">by the people</h1>*/}
      {/*<h1 className="profile-secondary">for the people</h1>*/}
      
      {/*<div className="profile-card">*/}
      {/*  <div className="profile-card-inner">*/}
      {/*    <label>Search from your posts</label>*/}
      {/*    <div className="profile-card-inner-search">*/}
      {/*      <div className="profile-card-inner-search-icon">*/}
      {/*        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"*/}
      {/*             stroke="#657789" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">*/}
      {/*          <circle cx="11" cy="11" r="8" />*/}
      {/*          <line x1="21" y1="21" x2="16.65" y2="16.65" />*/}
      {/*        </svg>*/}
      {/*      </div>*/}
      {/*      <div className="profile-card-inner-search-input">*/}
      {/*        <input placeholder="If you've created any..." />*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      
      {/*<div className="profile-card">*/}
      {/*  <h2>Hello,</h2>*/}
      {/*  <h1>User!</h1>*/}
      {/*</div>*/}
      <div className="buttons profile-logout">
        <button onClick={handleLogout} className="buttons-button">
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <p>Logout</p>
        </button>
      </div>
      
      {/*The Search bar needs a lil fixing*/}
      {/*<form className="search" action="">*/}
      {/*  <button type="submit">Search</button>*/}
      {/*  <input type="search" placeholder="Search your posts..." required />*/}
      {/*</form>*/}
      
      {uniqueWords.map((word: Word, index: number) => {
        const wordDefinitionsData = wordDefinitions[word.id];
        const currentDefinition = wordDefinitionsData.find((def: Definition) => def.isArabic === (currentLanguage[word.id] === 'ARABIC'));
        
        return (
          <div className="profile-post" key={word.id}>
            <div className="profile-post-language">
              <p className="profile-post-language-left">
                {currentLanguage[word.id] === 'ARABIC' ? 'ARABIC' : 'FRANCO-ARABIC'}
              </p>
              {wordDefinitionsData.length > 1 && (
                <div
                  className="profile-post-language-right"
                  onClick={() => handlePostLanguageClick(word.id)}
                >
                  <p>Switch translation</p>
                  &nbsp;
                  <FontAwesomeIcon icon={faArrowRight} className="profile-post-language-right-arrow" />
                </div>
              )}
            </div>
            <h2 dir={currentLanguage[word.id] === 'ARABIC' ? 'rtl' : 'ltr'}>
              {currentLanguage[word.id] === 'ARABIC' ? word.arabicWord : word.francoArabicWord}
            </h2>
            {editingPostId === currentDefinition?.id ? (
              <textarea
                typeof={'text'}
                value={editedText}
                className={`profile-post-inputtext`}
                rows={4}
                dir={currentLanguage === 'ARABIC' ? 'rtl' : 'ltr'}
                onChange={(e) => setEditedText(e.target.value)}
              />
            ) : (
              <p dir={currentDefinition?.isArabic ? 'rtl' : 'ltr'}>
                {currentDefinition?.definition}
              </p>
            )}
            <p className="profile-post-date">
              {currentDefinition?.AddedTimestamp && new Date(currentDefinition.AddedTimestamp).toLocaleDateString(
                'en-US', { year: 'numeric', month: 'long', day: 'numeric' },
              )}
            </p>
            <div className="buttons">
              {currentDefinition?.id && currentDefinition?.definition && (
                <button onClick={() => handleEditClick(currentDefinition.id, currentDefinition.definition)}
                        className="profile-post-buttons-button">
                  {editingPostId === currentDefinition.id ? 'Submit' : 'Edit'}
                </button>
              )}
              <button className="profile-post-buttons-button" disabled>
                <FontAwesomeIcon icon={faThumbsUp} />
                <p>{currentDefinition?.likeCount}</p>
              </button>
              <button className="profile-post-buttons-button" disabled>
                <FontAwesomeIcon icon={faThumbsDown} />
                <p>{currentDefinition?.dislikeCount}</p>
              </button>
              <button className="profile-post-buttons-button" disabled>
                <FontAwesomeIcon icon={faFlag} />
                <p>{currentDefinition?.reportCount}</p>
              </button>
            </div>
            {index !== uniqueWords.length - 1 && <hr />}
          </div>
        );
      })}
    </div>
  );
};

export default UserProfile;