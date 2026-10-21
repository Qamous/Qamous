import React, { useEffect, useMemo, useState } from 'react';
import './UserProfile.scss';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { API_URL, apiJson } from '../src/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons/faArrowRightFromBracket';
import { faFlag } from '@fortawesome/free-solid-svg-icons/faFlag';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons/faThumbsDown';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons/faThumbsUp';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import CustomDialog from '../src/components/CustomDialog';
import Snackbar from '../src/components/Snackbar';
import { useTranslation } from 'react-i18next';

//import { ReactComponent as ArrowForwardIcon } from '../../assets/arrow_forward.svg';
import LoadingSpinner from '../src/components/LoadingSpinner';

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

interface ProfileUser { id: number; firstName: string; username: string; }

const UserProfile = () => {
  const { data, isLoading, error } = useQuery<ProfileUser | null, Error>('profileSession', async () => {
    const result = await apiJson<{ session?: { passport?: { user?: ProfileUser } } }>(await fetch(`${API_URL}/auth/session`, { credentials: 'include' }));
    return result.session?.passport?.user || null;
  }, { retry: false, cacheTime: 0, staleTime: 0 });
  if (isLoading) return <LoadingSpinner />;
  if (error) return <p role="alert">{error.message}</p>;
  if (!data) return <Navigate to="/login" replace />;
  return <UserProfileContent userData={data} />;
};

const UserProfileContent = ({ userData }: { userData: ProfileUser }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [editedText, setEditedText] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submittingPostId, setSubmittingPostId] = useState<number | null>(null);
  const [isInvalidInput, setIsInvalidInput] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<{ [key: number]: 'ARABIC' | 'FRANCO-ARABIC' }>({});
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [likeSnackbarOpen, setLikeSnackbarOpen] = useState(false);
  const [dislikeSnackbarOpen, setDislikeSnackbarOpen] = useState(false);
  const [reportSnackbarOpen, setReportSnackbarOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});
  const [selectedDefinition, setSelectedDefinition] = useState<{ [key: number]: Definition | null }>({});
  const [currentDefinition, setCurrentDefinition] = useState<Definition | null>(null);
  const name: string = userData.firstName;
  const userId: number = userData.id;
  const username: string = userData.username;
  const { t, i18n } = useTranslation();
  
  const { data: definitions = [], isLoading, isError } = useQuery<Definition[]>(['definitions', userId], async () =>
    apiJson<Definition[]>(await fetch(`${API_URL}/definitions/user/${userId}`, { credentials: 'include' })),
    { staleTime: 0, refetchOnWindowFocus: true });
  const { data: userPoints, isLoading: isUserPointsLoading, isError: isUserPointsError } = useQuery(
    ['user', userId], async () => apiJson<{ points: number; definitionPoints?: number; wordBonusPoints?: number; reactionPoints?: number }>(
      await fetch(`${API_URL}/users/me/points`, { credentials: 'include' })),
    { staleTime: 0, refetchOnWindowFocus: true });
  const pointsReceived = userPoints?.points ?? 0;
  const { wordDefinitions, uniqueWords } = useMemo(() => {
    const grouped: { [key: number]: Definition[] } = {};
    const words: { [key: number]: Word } = {};
    for (const definition of definitions) {
      (grouped[definition.wordId] ||= []).push(definition);
      words[definition.wordId] = definition.word;
    }
    return { wordDefinitions: grouped, uniqueWords: Object.values(words) };
  }, [definitions]);
  
  const handlePostLanguageClick = (postId: number) => {
    setCurrentLanguage(prevState => ({
      ...prevState,
      [postId]: prevState[postId] === 'ARABIC' ? 'FRANCO-ARABIC' : 'ARABIC',
    }));
  };
  
  const logoutMutation = useMutation(() =>
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }),
    {
      onSuccess: () => {
        queryClient.clear();
        // Redirect to login page after successful logout
        navigate('/login');
      },
    },
  );
  
  const handleLogout = (): void => {
    logoutMutation.mutate();
  };
  
  const handleEditClick = (postId: number | undefined, definitionText: string | undefined): void => {
    if (postId === undefined || definitionText === undefined) {
      return;
    }
    
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
        const updatedDefinitionWithWordId = {
          ...updatedDefinition,
          definition: editedText,
        };
        fetch(`${API_URL}/definitions/${submittingPostId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedDefinitionWithWordId),
          credentials: 'include',
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error updating definition');
            }
            return response.json();
          })
          .then(data => {
            queryClient.setQueryData<Definition[]>(['definitions', userId], definitions.map(def => {
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
  
  const handleDeleteAccount = (): void => {
    setIsDeleteAccountDialogOpen(true);
  };
  
  const handleDeleteAccountSubmit = (): void => {
    fetch(`${API_URL}/users/` + userId, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Navigate to home page after successful account deletion
        navigate('/');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  
  const handleDeleteAccountClose = (): void => {
    setIsDeleteAccountDialogOpen(false);
  };
  
  const handleDialogCloseEdit = (): void => {
    setIsDialogOpen(false);
    setEditingPostId(null);
  };
  
  const handleLikeClick = () => {
    setLikeSnackbarOpen(false);
    // A delay to allow the state to propagate before the snackbar opens
    setTimeout(() => {
      setLikeSnackbarOpen(true);
    }, 100);
  };
  
  
  const handleDislikeClick = () => {
    setDislikeSnackbarOpen(false);
    // A delay to allow the state to propagate before the snackbar opens
    setTimeout(() => {
      setDislikeSnackbarOpen(true);
    }, 100);
  };
  
  const handleReportClick = () => {
    setReportSnackbarOpen(false);
    // A delay to allow the state to propagate before the snackbar opens
    setTimeout(() => {
      setReportSnackbarOpen(true);
    }, 100);
  };
  
  const handleDropdownToggle = (wordId: number) => {
    setDropdownVisible(prevState => ({
      ...prevState,
      [wordId]: !prevState[wordId],
    }));
  };
  
  const handleDefinitionSelect = (wordId: number, definition: Definition) => {
    setSelectedDefinition(prevState => ({
      ...prevState,
      [wordId]: definition,
    }));
    setCurrentDefinition(definition);
    setDropdownVisible(prevState => ({
      ...prevState,
      [wordId]: false,
    }));
  };
  
  const userRank = pointsReceived >= 150 ? "Word Master" : pointsReceived >= 100 ? "Contributor" : "Member";
  
  // Redirect to /profile if the user is on /signup or /login
  useEffect(() => {
    if (location.pathname !== '/profile') {
      navigate('/profile');
    }
  }, [location, navigate]);
  
  useEffect(() => {
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
  
  if (isLoading || isUserPointsLoading) {
    return (
      <div className="profile">
        <h2 className="profile-title">Hello!</h2>
        <LoadingSpinner />
      </div>
    );
  }
  if (isError || isUserPointsError) return <p role="alert">Temporarily unavailable. Please try again later. / الخدمة غير متاحة مؤقتاً</p>;
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
            buttonText1={t('common.confirm')}
            onButton1Click={handleDialogSubmitEdit}
            buttonText2={t('common.cancel')}
            onButton2Click={handleDialogCloseEdit}
            onClose={handleDialogCloseEdit}
          />
        )
      )}
      {isDeleteAccountDialogOpen && (
        <CustomDialog
          text={t('user_profile.delete_account_confirmation')}
          buttonText1={t('common.confirm')}
          onButton1Click={handleDeleteAccountSubmit}
          buttonText2={t('common.cancel')}
          onButton2Click={handleDeleteAccountClose}
          onClose={handleDeleteAccountClose}
        />
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
      <h2 className="profile-title" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        {t('user_profile.hi') + ' '}
        <span className="profile-title-name">{name}</span>
        !
      </h2>
      <h3 className="profile-subtitle">{username}</h3>
      <div className="profile-points-breakdown">
        <div className="points-total">{t('user_profile.points')}: {pointsReceived}</div>
        <div className="points-details">
          <div>{t('user_profile.definition_points')}: +{userPoints?.definitionPoints ?? definitions.length}</div>
          <div>{t('user_profile.word_bonus_points')}: +{userPoints?.wordBonusPoints ?? 0}</div>
          <div>{t('user_profile.reaction_points')}: {userPoints?.reactionPoints ?? definitions.reduce((sum, definition) => sum + definition.likeCount - definition.dislikeCount, 0)}</div>
          <div className="points-info">{t('user_profile.points_explanation')}</div>
        </div>
        <div className="user-rank">{t('user_profile.rank')}: {userRank}</div>
      </div>
      
      <div className="buttons buttons-between profile-logout">
        <button onClick={handleLogout} className="buttons-button">
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <p>
            {t('user_profile.logout')}
          </p>
        </button>
      </div>
      
      {/*The Search bar needs a lil fixing*/}
      {/*<form method="post" className="search" action="">*/}
      {/*  <button type="submit">Search</button>*/}
      {/*  <input type="search" placeholder="Search your posts..." required />*/}
      {/*</form>*/}
      
      {uniqueWords.length === 0 ? (
        <div className="empty_state">
          <i className="ion-sad-outline"></i>
          <h3>{t('user_profile.no_posts')}</h3>
          <p>{t('user_profile.no_posts_description')}</p>
          <button onClick={() => navigate('/add-definition')} className="buttons-button primary">
            {t('user_profile.add_first_definition')}
          </button>
        </div>
      ) : (
        uniqueWords.map((word: Word, index: number) => {
          const wordDefinitionsData = wordDefinitions[word.id];
          let currentDefinition = selectedDefinition[word.id] || wordDefinitionsData.find((def: Definition) => def.isArabic === (currentLanguage[word.id] === 'ARABIC'));
          
          // If there is no Franco-Arabic definition, show the Arabic definition
          if (!currentDefinition) {
            currentDefinition = wordDefinitionsData.find((def: Definition) => def.isArabic);
          }
          const displayArabic = !!currentDefinition?.isArabic;
          
          const otherDefinitions = wordDefinitionsData.filter(def => def.id !== currentDefinition?.id && def.isArabic === currentDefinition?.isArabic);
          
          return (
            <div className="profile-post" key={word.id}>
              <div className="profile-post-language">
                <p className="profile-post-language-left">
                  {displayArabic ?
                    t('user_profile.arabic') :
                    t('user_profile.franco_arabic')}
                </p>
                {wordDefinitionsData.length > 1 && (
                  <div
                    className="profile-post-language-right"
                    onClick={() => handlePostLanguageClick(word.id)}
                  >
                    <p>
                      {t('user_profile.switch_translation')}
                    </p>
                    &nbsp;
                    <FontAwesomeIcon icon={faArrowRight} className="profile-post-language-right-arrow" />
                  </div>
                )}
              </div>
              <h2 dir={displayArabic ? 'rtl' : 'ltr'}>
                {displayArabic ? word.arabicWord : word.francoArabicWord}
              </h2>
              {editingPostId === currentDefinition?.id ? (
                <textarea
                  typeof={'text'}
                  value={editedText}
                  className={`profile-post-inputtext`}
                  rows={4}
                  dir={displayArabic ? 'rtl' : 'ltr'}
                  onChange={(e) => setEditedText(e.target.value)}
                />
              ) : (
                <p dir={currentDefinition?.isArabic ? 'rtl' : 'ltr'}>
                  {currentDefinition?.definition}
                </p>
              )}
              <p className="profile-post-date">
                {currentDefinition?.AddedTimestamp && new Date(currentDefinition.AddedTimestamp).toLocaleDateString(
                  i18n.language === 'ar' ? 'ar-EG' : i18n.language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                )}
                {otherDefinitions.length > 0 && (
                  <>
                    <button className="buttons-button" onClick={() => handleDropdownToggle(word.id)}>
                      {t('user_profile.pick_other_definitions')}
                    </button>
                    {dropdownVisible[word.id] && (
                      <div className="dropdown">
                        {otherDefinitions.map(def => (
                          <div key={def.id} onClick={() => handleDefinitionSelect(word.id, def)}>
                            {def.definition}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </p>
              <div className="buttons buttons-between">
                {currentDefinition?.id && currentDefinition?.definition && (
                  <button onClick={() => handleEditClick(currentDefinition?.id, currentDefinition?.definition)}
                          className="profile-post-buttons-button">
                    {editingPostId === currentDefinition.id ? t('common.submit') : t('common.edit')}
                  </button>
                )}
                <button
                  className="profile-post-buttons-button profile-post-buttons-button-disabled"
                  onClick={handleLikeClick}
                >
                  <FontAwesomeIcon icon={faThumbsUp} />
                  <p>{currentDefinition?.likeCount ?? 0}</p>
                </button>
                <button
                  className="profile-post-buttons-button profile-post-buttons-button-disabled"
                  onClick={handleDislikeClick}
                >
                  <FontAwesomeIcon icon={faThumbsDown} />
                  <p>{currentDefinition?.dislikeCount ?? 0}</p>
                </button>
                <button
                  className="profile-post-buttons-button profile-post-buttons-button-disabled"
                  onClick={handleReportClick}
                >
                  <FontAwesomeIcon icon={faFlag} />
                  <p>{currentDefinition?.reportCount ?? 0}</p>
                </button>
              </div>
              {index !== uniqueWords.length - 1 && <hr />}
            </div>
          );
        })
      )
      }
      
      
      <div className="buttons buttons-between profile-delete">
        <button onClick={handleDeleteAccount} className="buttons-button">
          <FontAwesomeIcon icon={faTrash} />
          <p>
            {t('user_profile.delete_account')}
          </p>
        </button>
      </div>
      <Snackbar
        open={likeSnackbarOpen}
        message={t('user_profile.definition_like_error')}
      />
      <Snackbar
        open={dislikeSnackbarOpen}
        message={t('user_profile.definition_dislike_error')}
      />
      <Snackbar
        open={reportSnackbarOpen}
        message={t('user_profile.definition_report_error')}
      />
    </div>
  );
};

export default UserProfile;
