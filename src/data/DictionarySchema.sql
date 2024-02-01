-- Create a table to store users
CREATE TABLE Users (
    UserID INT PRIMARY KEY,
    Username TEXT NOT NULL,
    EmailAddress TEXT NOT NULL,
    PasswordHash TEXT NOT NULL, -- Store securely hashed and salted passwords
    FullName TEXT,
    ProfilePicture TEXT, -- Store the URL or reference to the profile picture
    DateOfBirth DATE
);

-- Create a table to store words, supporting Arabic and Franco-Arabic
CREATE TABLE Words (
    WordID INT PRIMARY KEY,
    ArabicWord TEXT NOT NULL,
    FrancoArabicWord TEXT,
    CountriesOfUse TEXT -- Store country/countries of use as a string
);

-- Create a table to store definitions, supporting Arabic and English
CREATE TABLE Definition (
    DefinitionID INT PRIMARY KEY,
    WordID INT NOT NULL,
    Definition TEXT,
    Example TEXT,
    AddedTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    LikeCount INT DEFAULT 0,
    Approved BIT DEFAULT 0,
    AddedByUserID INT,
    IsArabic TINYINT, -- 1 for Arabic, 0 for Franco-Arabic
    CHECK (IsArabic IN (0, 1)), -- Ensure IsArabic is either 0 or 1
    FOREIGN KEY (WordID) REFERENCES Words(WordID),
    FOREIGN KEY (AddedByUserID) REFERENCES Users(UserID)
);

-- Create a table to handle multiple definitions for the same word
CREATE TABLE WordDefinitions (
    WordID INT NOT NULL,
    DefinitionID INT NOT NULL,
    PRIMARY KEY (WordID, DefinitionID),
    FOREIGN KEY (WordID) REFERENCES Words(WordID),
    FOREIGN KEY (DefinitionID) REFERENCES Definition(DefinitionID)
);
