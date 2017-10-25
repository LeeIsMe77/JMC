USE master;
SET NOCOUNT ON;
GO

/**********************************************************************************************************\
Create database if it does not already exist
\**********************************************************************************************************/

--=CREATE-DATABASE=--

IF DB_ID(N'RotS') IS NULL CREATE DATABASE [RotS];
GO

ALTER DATABASE [RotS] SET ALLOW_SNAPSHOT_ISOLATION ON;
GO

USE [RotS];
GO

--=Creat login and user to access the database=--
IF SUSER_ID(N'JMCMudClient') IS NULL BEGIN
	CREATE LOGIN [JMCMudClient] WITH PASSWORD = N'P@ssw0rd', CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF;
END;
GO

IF USER_ID(N'JMCMudClient') IS NULL BEGIN
	CREATE USER [JMCMudClient] FOR LOGIN [JMCMudClient] WITH DEFAULT_SCHEMA = dbo;
END; 
ELSE BEGIN
	ALTER USER [JMCMudClient] WITH LOGIN = [JMCMudClient], DEFAULT_SCHEMA = dbo;
END;
GO

/**********************************************************************************************************\
Create Table Definitions
\**********************************************************************************************************/

IF OBJECT_ID(N'dbo.Character') IS NULL BEGIN
	CREATE TABLE dbo.[Character] (
		CharacterID int NOT NULL IDENTITY(1,1),
		CharacterName varchar(128) NOT NULL,
		[Password] varbinary(max) NULL,
		Race varchar(50) NULL,
		[Level] int NOT NULL CONSTRAINT dvCharacter_Level DEFAULT (1),
		WarriorLevel int NOT NULL CONSTRAINT dvCharacter_WarriorLevel DEFAULT (0),
		RangerLevel int NOT NULL CONSTRAINT dvCharacter_RangerLevel DEFAULT (0),
		MageLevel int NOT NULL CONSTRAINT dvCharacter_MageLevel DEFAULT (0),
		MysticLevel int NOT NULL CONSTRAINT dvCharacter_MysticLevel DEFAULT (0),
		Strength int NOT NULL CONSTRAINT dvCharacter_Strength DEFAULT (0),
		Intelligence int NOT NULL CONSTRAINT dvCharacter_Intelligence DEFAULT (0),
		Will int NOT NULL CONSTRAINT dvCharacter_Will DEFAULT (0),
		Dexterity int NOT NULL CONSTRAINT dvCharacter_Dexterity DEFAULT (0),
		Constitution int NOT NULL CONSTRAINT dvCharacter_Constitution DEFAULT (0),
		LearningAbility int NOT NULL CONSTRAINT dvCharacter_LearningAbility DEFAULT (0),
		Specialization varchar(128) NULL,
		XPNeededToLevel int NOT NULL CONSTRAINT dvCharacter_XPNeededToLevel DEFAULT(0),
		DateCreated datetime NOT NULL CONSTRAINT dvCharacter_DateCreated DEFAULT CURRENT_TIMESTAMP,
		DateUpdated datetime NOT NULL CONSTRAINT dvCharacter_DateUpdated DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT pkCharacter PRIMARY KEY CLUSTERED (CharacterID),
		CONSTRAINT ukCharacter_CharacterName UNIQUE (CharacterName)
	);
END;
GO

IF OBJECT_ID(N'dbo.Exception') IS NULL BEGIN
	CREATE TABLE dbo.[Exception] (
		ExceptionID int NOT NULL IDENTITY(1,1),
		ExceptionMessage varchar(max) NULL,
		DateCreated datetime NOT NULL CONSTRAINT dvException_DateCreated DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT pkException PRIMARY KEY CLUSTERED (ExceptionID),
	);
END;
GO

IF OBJECT_ID(N'dbo.Room') IS NULL BEGIN
	CREATE TABLE dbo.[Room] (
		RoomID int NOT NULL IDENTITY(1,1),
		RoomName varchar(100) NOT NULL,
		ZoneType varchar(20) NOT NULL,
		RoomExits varchar(20) NULL,
		Exit1 varchar(50) NULL,
		Exit2 varchar(50) NULL,
		Exit3 varchar(50) NULL,
		CONSTRAINT pkRoom PRIMARY KEY CLUSTERED (RoomID),
		CONSTRAINT ukRoom_RoomName_RoomExits_ZoneType UNIQUE (RoomName, RoomExits, ZoneType)
	);
END;
GO

/**********************************************************************************************************\
Create indexes to optimize specific query scenarios
\**********************************************************************************************************/

IF INDEXPROPERTY(OBJECT_ID(N'dbo.Character'), N'ixCharacter_CharacterName', N'IndexID') IS NULL BEGIN
	CREATE NONCLUSTERED INDEX ixCharacter_CharacterName
		ON dbo.[Character] (CharacterID)
		INCLUDE (CharacterName);
END;
GO

/**********************************************************************************************************\
Create Functions
\**********************************************************************************************************/

DECLARE @FunctionName sysname = N'dbo.DecryptPassword';
IF OBJECT_ID(@FunctionName) IS NULL BEGIN
	EXECUTE(N'CREATE FUNCTION ' + @FunctionName + N'() RETURNS sysname AS BEGIN RETURN NULL; END;');
END;
GO

ALTER FUNCTION dbo.[DecryptPassword](
	@Passphrase nvarchar(max),
	@Value varbinary(max)
) RETURNS varchar(max) AS BEGIN
	RETURN DECRYPTBYPASSPHRASE(dbo.GetPassphrase() + @Passphrase, @Value);
	END;
GO

DECLARE @FunctionName sysname = N'dbo.EncryptPassword';
IF OBJECT_ID(@FunctionName) IS NULL BEGIN
	EXECUTE(N'CREATE FUNCTION ' + @FunctionName + N'() RETURNS sysname AS BEGIN RETURN NULL; END;');
END;
GO

ALTER FUNCTION dbo.[EncryptPassword](
	@Passphrase nvarchar(max),
	@Value varchar(max)
) RETURNS varbinary(max) AS BEGIN
	RETURN ENCRYPTBYPASSPHRASE(dbo.GetPassphrase() + @Passphrase, @Value);
	END;
GO

DECLARE @FunctionName sysname = N'dbo.GetPassphrase';
IF OBJECT_ID(@FunctionName) IS NULL BEGIN
	EXECUTE(N'CREATE FUNCTION ' + @FunctionName + N'() RETURNS sysname AS BEGIN RETURN NULL; END;');
END;
GO

ALTER FUNCTION dbo.[GetPassphrase]() RETURNS varchar(max) AS BEGIN
	RETURN N'EnterACustomPassphraseHereToAppendToACharacterNameToGenerateAnEncryptedPassword';
	END;
GO

/**********************************************************************************************************\
Create Stored Procedures
\**********************************************************************************************************/

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[CharacterCollection.Add]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[CharacterCollection.Add] (
	@CharacterName varchar(128),
	@CharacterID int = NULL OUTPUT
) AS BEGIN
	SET NOCOUNT ON;
	DECLARE @InsertedIDs TABLE (InsertedID int NOT NULL);
		
	IF NULLIF(@CharacterName, N'') IS NULL BEGIN
		RAISERROR(N'A character name must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF EXISTS (
		SELECT 1
			FROM dbo.[Character] C
			WHERE 1=1
				AND C.CharacterName LIKE @CharacterName
	) BEGIN
		RAISERROR(N'The character name ''%s'' already exists.', 16, 1, @CharacterName);
		RETURN @@ERROR;
	END

	INSERT dbo.[Character] (CharacterName)
		OUTPUT INSERTED.CharacterID INTO @InsertedIDs (InsertedID)
		VALUES (@CharacterName)

	SELECT @CharacterID = InsertedID
		FROM @InsertedIDs

	RETURN @@ERROR
END;
GO

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[CharacterCollection.Enumerate]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[CharacterCollection.Enumerate] AS BEGIN
	SET NOCOUNT ON;
	SELECT
			C.CharacterID AS CharacterID,
			C.CharacterName AS CharacterName,
			C.Race AS Race,
			C.[Level] AS [Level],
			C.XPNeededToLevel AS XPNeededToLevel,
			C.DateUpdated AS [LastLogon]
		FROM dbo.[Character] C
		ORDER BY C.DateUpdated DESC
	RETURN @@ERROR
END;
GO

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[Character.Initialize]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[Character.Initialize] (
	@CharacterID int = NULL,
	@CharacterName varchar(128) = NULL OUTPUT,
	@Password varchar(max) = NULL OUTPUT,
	@Race varchar(50) = NULL OUTPUT,
	@Level int = NULL OUTPUT,
	@WarriorLevel int = NULL OUTPUT,
	@RangerLevel int = NULL OUTPUT,
	@MysticLevel int = NULL OUTPUT,
	@MageLevel int = NULL OUTPUT,
	@Strength int = NULL OUTPUT,
	@Intelligence int = NULL OUTPUT,
	@Will int = NULL OUTPUT,
	@Dexterity int = NULL OUTPUT,
	@Constitution int = NULL OUTPUT,
	@LearningAbility int = NULL OUTPUT,
	@Specialization varchar(128) = NULL OUTPUT,
	@XPNeededToLevel int = NULL OUTPUT
) AS BEGIN
	SET NOCOUNT ON;
	
	IF NULLIF(@CharacterID, N'') IS NULL BEGIN
		RAISERROR(N'The character ID must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF NOT EXISTS (
		SELECT *
			FROM dbo.[Character] C
			WHERE 1=1
				AND C.CharacterID = @CharacterID
	) BEGIN
		RAISERROR(N'No character exists with the ID ''%i''.', 16, 1, @CharacterID);
		RETURN @@ERROR;
	END

	SELECT
			@CharacterName = C.CharacterName,
			@Password = dbo.[DecryptPassword](C.CharacterName, C.[Password]),
			@Race = C.Race,
			@Level = C.[Level],
			@WarriorLevel = C.WarriorLevel,
			@RangerLevel = C.RangerLevel,
			@MysticLevel = C.MysticLevel,
			@MageLevel = C.MageLevel,
			@Strength = C.Strength,
			@Intelligence = C.Intelligence,
			@Will = C.Will,
			@Dexterity = C.Dexterity,
			@Constitution = C.Constitution,
			@LearningAbility = C.LearningAbility,
			@Specialization = C.Specialization,
			@XPNeededToLevel = C.XPNeededToLevel
		FROM dbo.[Character] C
		WHERE 1=1
			AND C.CharacterID = @CharacterID

	RETURN @@ERROR
END;
GO

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[Character.Update]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[Character.Update] (
	@CharacterID int,
	@CharacterName varchar(128) NULL,
	@Password varchar(max) NULL,
	@Race varchar(50) NULL,
	@Level int NULL,
	@WarriorLevel int NULL,
	@RangerLevel int NULL,
	@MysticLevel int NULL,
	@MageLevel int NULL,
	@Strength int NULL,
	@Intelligence int NULL,
	@Will int NULL,
	@Dexterity int NULL,
	@Constitution int NULL,
	@LearningAbility int NULL,
	@Specialization varchar(128) NULL,
	@XPNeededToLevel int NULL
) AS BEGIN
	SET NOCOUNT ON;
	DECLARE @UpdatedPassword varbinary(max) = NULL;

	IF NULLIF(@Password, N'') IS NOT NULL BEGIN
	--TODO: Actually encrypt password. >.>
		SET @UpdatedPassword = CONVERT(varbinary(max), @Password)
	END
	
	UPDATE dbo.[Character]
		SET
			CharacterName = ISNULL(NULLIF(@CharacterName, N''), CharacterName),
			[Password] = ISNULL(dbo.[EncryptPassword](@CharacterName, @UpdatedPassword), [Password]),
			Race = ISNULL(NULLIF(@Race, N''), Race),
			[Level] = ISNULL(@Level, [Level]),
			WarriorLevel = ISNULL(@WarriorLevel, WarriorLevel),
			RangerLevel = ISNULL(@RangerLevel, RangerLevel),
			MysticLevel = ISNULL(@MysticLevel, MysticLevel),
			MageLevel = ISNULL(@MageLevel, MageLevel),
			Strength = ISNULL(@Strength, Strength),
			Intelligence = ISNULL(@Intelligence, Intelligence),
			Will = ISNULL(@Will, Will),
			Dexterity = ISNULL(@Dexterity, Dexterity),
			Constitution = ISNULL(@Constitution, Constitution),
			LearningAbility = ISNULL(@LearningAbility, LearningAbility),
			Specialization = ISNULL(NULLIF(@Specialization, N''), Specialization),
			XPNeededToLevel = ISNULL(NULLIF(@XPNeededToLevel, N''), XPNeededToLevel),
			DateUpdated = CURRENT_TIMESTAMP
		WHERE CharacterID = @CharacterID

	RETURN @@ERROR
END;
GO

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[Exception.LogException]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[Exception.LogException] (
	@ExceptionMessage varchar(max) NULL
) AS BEGIN
	SET NOCOUNT ON;
	
	IF NULLIF(@ExceptionMessage, N'') IS NULL BEGIN
		RETURN @@ERROR
	END

	INSERT dbo.Exception (ExceptionMessage)
		VALUES (@ExceptionMessage)

	RETURN @@ERROR
END;
GO

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[Room.Initialize]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[Room.Initialize] (
	@RoomName varchar(100),
	@ZoneType varchar(20),
	@RoomExits varchar(20) = NULL --Not currently used.
) AS BEGIN
	SET NOCOUNT ON;
	
	IF NULLIF(@RoomName, N'') IS NULL BEGIN
		RAISERROR(N'The room name is required.', 16, 1);
		RETURN @@ERROR;
	END

	IF NULLIF(@ZoneType, N'') IS NULL BEGIN
		RAISERROR(N'The zone type is required.', 16, 1);
		RETURN @@ERROR;
	END

	SELECT TOP 1
			R.RoomName AS [RoomName],
			R.ZoneType AS [ZoneType],
			R.RoomExits AS [RoomExits],
			R.Exit1 AS [Exit1],
			R.Exit2 AS [Exit2],
			R.Exit3 AS [Exit3]
		FROM dbo.Room R
		WHERE 1=1
			AND R.RoomName LIKE @RoomName
			AND R.ZoneType LIKE @ZoneType

	RETURN @@ERROR
END;
GO

/**********************************************************************************************************\
Populate tables with default data
\**********************************************************************************************************/

IF NOT EXISTS (SELECT 1 FROM dbo.Room) BEGIN
	INSERT dbo.Room (RoomName, RoomExits, Exit1, Exit2, Exit3, ZoneType)
		VALUES 
		(N'A Bald Boulder',N'NE',N'ensesw',NULL, NULL, N'Vale'),
		(N'A Break in the Forest',N'NES',N'nnnnww',N'e', NULL, N'Vale'),
		(N'A Busy Place',N'NE',N'new',NULL, NULL, N'Vale'),
		(N'A Creepy Thicket',N'NEW',N'wsssnesw',N'nnesew', NULL, N'Vale'),
		(N'A Dark Copse',N'EW',N'wnnw',NULL, NULL, N'Vale'),
		(N'A Dark Track',N'NW',N'wnesew',NULL, NULL, N'Vale'),
		(N'A Deep Depression',N'NW',N'wwewenw',NULL, NULL, N'Vale'),
		(N'A Gruesome Scene',N'NS',N'sesnnww',NULL, NULL, N'Vale'),
		(N'A Large Depression',N'SW',N'sesw',NULL, NULL, N'Vale'),
		(N'A Musty Smell',N'NE',N'nwssw',NULL, NULL, N'Vale'),
		(N'A Narrow Run',N'ES',N'ewnesew',NULL, NULL, N'Vale'),
		(N'A Rocky Outcrop',N'ES',N'enwsnww',NULL, NULL, N'Vale'),
		(N'A Rotting Windfall',N'NSW',N'wsnnnw',NULL, NULL, N'Vale'),
		(N'A Small Clearing',N'NE',N'nssnnnww',NULL, NULL, N'Vale'),
		(N'A Small Knoll',N'NS',N'nsenenw',NULL, NULL, N'Vale'),
		(N'A Small Spring',N'NE',N'nnnw',NULL, NULL, N'Vale'),
		(N'A Stagnant Odor',N'NS',N'nsnsnww',NULL, NULL, N'Vale'),
		(N'A Strange Barrow',N'NW',N'nwwwww',NULL, NULL, N'Vale'),
		(N'A Strange Vapour',N'NESW',N'esw',NULL, NULL, N'Vale'),
		(N'A Stray Boulder',N'ESW',N'sewnnsnnnww',NULL, NULL, N'Vale'),
		(N'A Tragic Scene',N'NES',N'ssnww',N'eeneenesene', NULL, N'Vale'),
		(N'A Turn',N'EW',N'wsesew',NULL, NULL, N'Vale'),
		(N'Accursed Vale',N'NE',N'nwsew',NULL, NULL, N'Vale'),
		(N'An Ancient Ossuary',N'ESW',N'wesnnww',NULL, NULL, N'Vale'),
		(N'An Inverted Forest',N'SW',N'wsew',NULL, NULL, N'Vale'),
		(N'An Old Camp',N'ESW',N'wwesew',NULL, NULL, N'Vale'),
		(N'Another Dead End',N'ESW',N'sssnww',N'seeneenesene', NULL, N'Vale'),
		(N'Ash Pit',N'NES',N'nnw',NULL, NULL, N'Vale'),
		(N'Baleful Darkness',N'ES',N'ennnnww',NULL, NULL, N'Vale'),
		(N'Bearded Old Man',N'NES',N'newnnewennw',NULL, NULL, N'Vale'),
		(N'Black Ferns',N'NE',N'ewwnnww',NULL, NULL, N'Vale'),
		(N'Black Vines',N'ES',N'eesnww',NULL, NULL, N'Vale'),
		(N'Black Wood',N'NEW',N'nwesew',NULL, NULL, N'Vale'),
		(N'Bleeding Trees',N'SW',N'sewenw',NULL, NULL, N'Vale'),
		(N'Bog of Darkness',N'NSW',N'wwesewenw',NULL, NULL, N'Vale'),
		(N'Brackish Waters',N'SW',N'wnnsnnnww',NULL, NULL, N'Vale'),
		(N'Breathing Forest',N'ES',N'ssnennw',NULL, NULL, N'Vale'),
		(N'Broken Land',N'NSW',N'snnnww',NULL, NULL, N'Vale'),
		(N'Broken Rocks',N'NSW',N'wesew',NULL, NULL, N'Vale'),
		(N'Brothel of Trees',N'NESW',N'nnww',NULL, NULL, N'Vale'),
		(N'Change in Course',N'NEW',N'nnnewennw',NULL, NULL, N'Vale'),
		(N'Charred Trees',N'NE',N'esew',NULL, NULL, N'Vale'),
		(N'Choked Path',N'NSW',N'nsnww',NULL, NULL, N'Vale'),
		(N'Churning Trees',N'SW',N'wensnww',NULL, NULL, N'Vale'),
		(N'Circle of Trees',N'ESW',N'sew',NULL, NULL, N'Vale'),
		(N'Cluster of Oaks',N'NESW',N'snesw',NULL, NULL, N'Vale'),
		(N'Conic Mushrooms',N'NS',N'ssnenw',NULL, NULL, N'Vale'),
		(N'Corrupt Trees',N'NS',N'nsesnnww',NULL, NULL, N'Vale'),
		(N'Crowded Forest Floor',N'NSW',N'nsnenw',NULL, NULL, N'Vale'),
		(N'Crowded Path',N'NS',N'swnwenw',NULL, NULL, N'Vale'),
		(N'Cul De Sac',N'EW',N'wennw',NULL, NULL, N'Vale'),
		(N'Curving Path',N'NS',N'snewennw',NULL, NULL, N'Vale'),
		(N'Damp Woods',N'ES',N'eeesw',NULL, NULL, N'Vale'),
		(N'Dark Dense Forest',N'NEW',N'wessesw',NULL, NULL, N'Vale'),
		(N'Dark Forest Continues',N'NES',N'essnenw',N'esene', NULL, N'Vale'),
		(N'Dark Forest Path',N'SW',N'snsnww',NULL, NULL, N'Vale'),
		(N'Dark Green Moss',N'NS',N'nww',N'nwnneeseeneenesene', NULL, N'Vale'),
		(N'Dark Halls',N'NE',N'nsesew',NULL, NULL, N'Vale'),
		(N'Dark Hollow',N'NE',N'nnsewenw',NULL, NULL, N'Vale'),
		(N'Dark Massive Forest',N'NSW',N'ssesw',NULL, NULL, N'Vale'),
		(N'Dark Pit',N'NES',N'nennw',NULL, NULL, N'Vale'),
		(N'Dark Putrid Waters',N'NS',N'ssesew',NULL, NULL, N'Vale'),
		(N'Dark Valley Forest',N'NSW',N'nenw',NULL, NULL, N'Vale'),
		(N'Darkling Path',N'NSW',N'wenw',NULL, NULL, N'Vale'),
		(N'Darkness',N'ESW',N'wnnww',NULL, NULL, N'Vale'),
		(N'Dead Trees',N'NE',N'esewenw',NULL, NULL, N'Vale'),
		(N'Decaying Marsh',N'NS',N'nwnnsnnnww',NULL, NULL, N'Vale'),
		(N'Deep in the Swamp',N'NEW',N'ennsnnnww',NULL, NULL, N'Vale'),
		(N'Deep Moss',N'NW',N'nwsnww',NULL, NULL, N'Vale'),
		(N'Deep Waters',N'ESW',N'eennsnnnww',NULL, NULL, N'Vale'),
		(N'Dense Brush',N'ES',N'eeessesw',NULL, NULL, N'Vale'),
		(N'Dense Dark Woodland',N'NES',N'nesew',NULL, NULL, N'Vale'),
		(N'Dense Underbrush',N'NW',N'wnnsnww',NULL, NULL, N'Vale'),
		(N'Dim Vale',N'SW',N'snnw',NULL, NULL, N'Vale'),
		(N'Dire Trees',N'ESW',N'esssnww',N'eseeneenesene', NULL, N'Vale'),
		(N'Distrubing Noises',N'NSW',N'ssnesw',NULL, NULL, N'Vale'),
		(N'Disturbing Undergrowth',N'NS',N'nnsssnesw',NULL, NULL, N'Vale'),
		(N'Drier Marshland',N'NES',N'eewsesew',NULL, NULL, N'Vale'),
		(N'Drifting Track',N'NEW',N'eewsesew',NULL, NULL, N'Vale'),
		(N'Dripping Moss',N'ESW',N'wsnnww',N'eenesene', NULL, N'Vale'),
		(N'Dusky Wood',N'ESW',N'eessesw',NULL, NULL, N'Vale'),
		(N'Dusty Hollow',N'ES',N'ennw',NULL, NULL, N'Vale'),
		(N'Dusty Smell',N'NS',N'sewwnnww',NULL, NULL, N'Vale'),
		(N'Eerie Marsh',N'ESW',N'ssnnewennw',NULL, NULL, N'Vale'),
		(N'Endless Path',N'NE',N'ennw',NULL, NULL, N'Vale'),
		(N'Entrance to Path',N'EW',N'eesw',NULL, NULL, N'Vale'),
		(N'Entrance to the Hidden Vale',N'EW',NULL,N'enneeseeneenesene', N'eewswew', N'Vale'),
		(N'Eryn Lome',N'NESW',N'snennw',NULL, NULL, N'Vale'),
		(N'Eryn Wethrin',N'ES',N'esnennw',NULL, NULL, N'Vale'),
		(N'Faint Path',N'EW',N'esnennw',NULL, NULL, N'Vale'),
		(N'Fallen Leaves',N'NSW',N'snwsnww',NULL, NULL, N'Vale'),
		(N'Fallen Trees',N'NESW',N'snww',NULL, NULL, N'Vale'),
		(N'False Hope',N'NW',N'nnnww',NULL, NULL, N'Vale'),
		(N'Flooded Forest',N'ES',N'snnnewennw',NULL, NULL, N'Vale'),
		(N'Forest Guardians',N'NSW',N'nsewenw',NULL, NULL, N'Vale'),
		(N'Forest Ledge',N'ES',N'senenw',NULL, NULL, N'Vale'),
		(N'Forest of Despair',N'NE',N'nnnww',NULL, NULL, N'Vale'),
		(N'Forest of Endless Night',N'NES',N'ewenw',NULL, NULL, N'Vale'),
		(N'Game Trail',N'EW',N'ewennw',N'eneenesene', NULL, N'Vale'),
		(N'Ghastly Trees',N'NW',N'nesw',NULL, NULL, N'Vale'),
		(N'Giant Ancient Trees',N'NEWU',N'nnnnnww',N'ne', NULL, N'Vale'),
		(N'Gleaming Eyes',N'NES',N'snenw',N'ene', NULL, N'Vale'),
		(N'Gloomy Trees',N'ES',N'esnnnww',NULL, NULL, N'Vale'),
		(N'Grasping Thorns',N'NW',N'wwnnww',NULL, NULL, N'Vale'),
		(N'Hairy Trees',N'NES',N'esew',NULL, NULL, N'Vale'),
		(N'Heartless Trees',N'SW',N'wnnwenw',NULL, NULL, N'Vale'),
		(N'Hedge of Thorns',N'NESW',N'sessesw',NULL, NULL, N'Vale'),
		(N'High Up In a Tree',N'D',N'dnnnnnww',NULL, NULL, N'Vale'),
		(N'Hollow Tree',N'NS',N'nsew',NULL, NULL, N'Vale'),
		(N'Inky Forest',N'NW',N'wnewennw',NULL, NULL, N'Vale'),
		(N'Inside the Cave',N'S',N'sewwesewenw',NULL, NULL, N'Vale'),
		(N'Into the Swamp',N'NEW',N'ennsnnnww',NULL, NULL, N'Vale'),
		(N'Leaving the Hidden Vale',N'EW',N'wnnnnww',NULL, NULL, N'Vale'),
		(N'Leaving the Swamp',N'NESW',N'sesew',NULL, NULL, N'Vale'),
		(N'Lords of the Night',N'ES',N'esswnwenw',NULL, NULL, N'Vale'),
		(N'Lost Amongst the Giants',N'ESW',N'wnnewennw',NULL, NULL, N'Vale'),
		(N'Lost in the Valley',N'ES',N'ensesw',NULL, NULL, N'Vale'),
		(N'Malevolent Pines',N'EW',N'ensnsnww',NULL, NULL, N'Vale'),
		(N'Massive Oaks',N'NE',N'enw',NULL, NULL, N'Vale'),
		(N'Mat of Death',N'ES',N'enwesew',NULL, NULL, N'Vale'),
		(N'Maze of Bracken',N'NS',N'nsnnnww',NULL, NULL, N'Vale'),
		(N'Mirkwood',N'ES',N'snnsew',NULL, NULL, N'Vale'),
		(N'Mist',N'NEW',N'wesew',NULL, NULL, N'Vale'),
		(N'Mist Covered Bog',N'NS',N'newennw',NULL, NULL, N'Vale'),
		(N'Moist Breeze',N'NE',N'eewennw',NULL, NULL, N'Vale'),
		(N'Moody Trees',N'NES',N'nwenw',NULL, NULL, N'Vale'),
		(N'Mosquito Infested Waters',N'NSW',N'nsnnewennw',NULL, NULL, N'Vale'),
		(N'Mossy Trees',N'NE',N'ewnnwenw',NULL, NULL, N'Vale'),
		(N'Motionless Swamp',N'NEW',N'nnsnnnww',NULL, NULL, N'Vale'),
		(N'Muddy Path',N'NSW',N'wwww',NULL, NULL, N'Vale'),
		(N'Murky Waters',N'NE',N'eeennsnnnww',NULL, NULL, N'Vale'),
		(N'Obsidian Wood',N'ES',N'enenw',NULL, NULL, N'Vale'),
		(N'Old Forest',N'ES',N'ewennw',NULL, NULL, N'Vale'),
		(N'On Spongy Ground',N'NEW',N'ewnnsnnnww',NULL, NULL, N'Vale'),
		(N'Opaque Darkness',N'NEW',N'esesw',NULL, NULL, N'Vale'),
		(N'Oppressive Feeling',N'EW',N'www',NULL, NULL, N'Vale'),
		(N'Outside a Cave',N'NE',N'ewwesewenw',NULL, NULL, N'Vale'),
		(N'Overt Malice',N'NE',N'nnwenw',NULL, NULL, N'Vale'),
		(N'Pale Mist',N'NES',N'ew',NULL, NULL, N'Vale'),
		(N'Pale Shroud',N'ESW',N'ensnww',NULL, NULL, N'Vale'),
		(N'Patch of Mushrooms',N'SW',N'wwnew',NULL, NULL, N'Vale'),
		(N'Pressing Darkness',N'NES',N'nensnww',NULL, NULL, N'Vale'),
		(N'Quiet Corner',N'NEW',N'essesw',NULL, NULL, N'Vale'),
		(N'Random Stones',N'NE',N'newenw',NULL, NULL, N'Vale'),
		(N'Reaching Branches',N'NSW',N'wssw',NULL, NULL, N'Vale'),
		(N'Returning to the Forest',N'NEW',N'wenw',N'eeseeneenesene', NULL, N'Vale'),
		(N'Ring of Stones',N'NS',N'ssnww',NULL, NULL, N'Vale'),
		(N'Rising Forest',N'NESW',N'newennw',NULL, NULL, N'Vale'),
		(N'Rocky Forest Floor',N'ESW',N'esnnww',NULL, NULL, N'Vale'),
		(N'Rotting Beeches',N'NEW',N'wnew',NULL, NULL, N'Vale'),
		(N'Rotting Treestump',N'NSW',N'nsesw',NULL, NULL, N'Vale'),
		(N'Row of Elms',N'ESW',N'ww',N'wnneeseeneenesene', NULL, N'Vale'),
		(N'Scarred Land',N'NSW',N'sswnwenw',NULL, NULL, N'Vale'),
		(N'Sea of Trees',N'NS',N'sesw',NULL, NULL, N'Vale'),
		(N'Shadowy Hues',N'SW',N'wsnww',NULL, NULL, N'Vale'),
		(N'Shallow Waters',N'ESW',N'wennsnnnww',NULL, NULL, N'Vale'),
		(N'Sharp Spears',N'NE',N'nwwesew',NULL, NULL, N'Vale'),
		(N'Shifting Trees',N'NSW',N'nnnnww',NULL, NULL, N'Vale'),
		(N'Sickly Forest',N'NES',N'nnsnww',NULL, NULL, N'Vale'),
		(N'Silent Arena',N'NS',N'nsessesw',NULL, NULL, N'Vale'),
		(N'Silent Trees',N'ES',N'snnnw',NULL, NULL, N'Vale'),
		(N'Sleeping Forest',N'ES',N'eswwww',NULL, NULL, N'Vale'),
		(N'Slushy Ground',N'NS',N'snwenw',NULL, NULL, N'Vale'),
		(N'Smell of Decay',N'EW',N'wewenw',NULL, NULL, N'Vale'),
		(N'Snare of Pines',N'ESW',N'ssnenw',N'sene', NULL, N'Vale'),
		(N'Solid Ground Once Again',N'NES',N'nnewennw',NULL, NULL, N'Vale'),
		(N'Split Path',N'EW',N'wnnww',NULL, NULL, N'Vale'),
		(N'Spongy Ground',N'NESW',N'sssesw',NULL, NULL, N'Vale'),
		(N'Strange Lights',N'NES',N'nwenw',N'neeseeneenesene', NULL, N'Vale'),
		(N'Strange Marsh',N'NSW',N'snnewennw',NULL, NULL, N'Vale'),
		(N'Strangled Forest',N'NE',N'eswwww',NULL, NULL, N'Vale'),
		(N'Sunken Path',N'NESW',N'wennnnww',NULL, NULL, N'Vale'),
		(N'Surreal Forest',N'NES',N'ennww',NULL, NULL, N'Vale'),
		(N'Taur-e-Duath',N'NW',N'nesnennw',NULL, NULL, N'Vale'),
		(N'Taur-nu-Fuin',N'ESW',N'wesewenw',NULL, NULL, N'Vale'),
		(N'Taur-nu-Morna',N'NSW',N'sw',NULL, NULL, N'Vale'),
		(N'The Barrier',N'NS',N'sssnww',NULL, NULL, N'Vale'),
		(N'The Channel',N'EW',N'ewnnewennw',NULL, NULL, N'Vale'),
		(N'The Dark Wood',N'NES',N'swesew',NULL, NULL, N'Vale'),
		(N'The Great Pine',N'NEW',N'esnww',NULL, NULL, N'Vale'),
		(N'The Ground Grows Soft',N'NW',N'nnnenw',NULL, NULL, N'Vale'),
		(N'The Path',N'NSW',N'wnwenw',NULL, NULL, N'Vale'),
		(N'Thick Bramble',N'NE',N'ewnnww',NULL, NULL, N'Vale'),
		(N'Thick Underbrush',N'NS',N'nnenw',NULL, NULL, N'Vale'),
		(N'Thick, Dark Forest',N'NS',N'sennww',NULL, NULL, N'Vale'),
		(N'Thin Trail On Hill',N'NESW',N'w',N'nneeseeneenesene', NULL, N'Vale'),
		(N'Thundering Darkness',N'NES',N'nssnenw',NULL, NULL, N'Vale'),
		(N'Timeless Trees',N'NS',N'snenw',NULL, NULL, N'Vale'),
		(N'Tortured Land',N'ES',N'swesew',NULL, NULL, N'Vale'),
		(N'Twisted Pines',N'NES',N'sssnesw',NULL, NULL, N'Vale'),
		(N'Twisted Trail',N'NEW',N'nessnenw',N'nesene', NULL, N'Vale'),
		(N'Unclimbable Cliff',N'NESW',N'swwww',NULL, NULL, N'Vale'),
		(N'Unkempt Forest',N'NSW',N'nw',N'nnneeseeneenesene', NULL, N'Vale'),
		(N'Vigilent Forest',N'NEW',N'wennw',N'neenesene', NULL, N'Vale'),
		(N'Weaving Mists',N'ESW',N'nsssnesw',NULL, NULL, N'Vale'),
		(N'West of the Thicket',N'NW',N'nswesew',NULL, NULL, N'Vale'),
		(N'Whispering Pines',N'SW',N'wewnesew',NULL, NULL, N'Vale'),

		(N'A Bleached Skeleton', NULL,N'swneee',NULL,NULL, N'Faroth'),
		(N'A Broad Depression', NULL,N'esnewwe',NULL,NULL, N'Faroth'),
		(N'A Clear Spring', NULL,N'wwwwe',NULL,NULL, N'Faroth'),
		(N'A Deep Ditch', NULL,N'wwsese',N'wes',NULL, N'Faroth'),
		(N'A Frightening Warning', NULL,N'wnnsse',NULL,NULL, N'Faroth'),
		(N'A Gushing Spring', NULL,N'nssssse',NULL,NULL, N'Faroth'),
		(N'A Kill Site', NULL,N'nnsese',NULL,NULL, N'Faroth'),
		(N'A Lazy Waterfall', NULL,N'ewsese',N'ees',NULL, N'Faroth'),
		(N'A Lone Tree', NULL,N'nswneee',NULL,NULL, N'Faroth'),
		(N'A Low Riverbank', NULL,N'eewe',NULL,NULL, N'Faroth'),
		(N'A Shallow Bog', NULL,N'nwwe',NULL,NULL, N'Faroth'),
		(N'A Stone Quarry', NULL,N'wwwsese',NULL,NULL, N'Faroth'),
		(N'Abused Woods', NULL,N'ennsese',N'sn',NULL, N'Faroth'),
		(N'Altar of Bones', NULL,N'swnnwwe',NULL,NULL, N'Faroth'),
		(N'Ancient Trees', NULL,N'nnnee',NULL,NULL, N'Faroth'),
		(N'Barren Forest Floor', NULL,N'sese',NULL,NULL, N'Faroth'),
		(N'Bed of Stones', NULL,N'ewe',NULL,NULL, N'Faroth'),
		(N'Before a Cave', NULL,N'wnee',NULL,NULL, N'Faroth'),
		(N'Bending River', NULL,N'wseewe',NULL,NULL, N'Faroth'),
		(N'Berry Bushes', NULL,N'nssee',NULL,NULL, N'Faroth'),
		(N'Between Cliffs', NULL,N'nnnsse',NULL,NULL, N'Faroth'),
		(N'Blackened Rocks', NULL,N'wnwwse',NULL,NULL, N'Faroth'),
		(N'Bloody Waters', NULL,N'wwseewe',NULL,NULL, N'Faroth'),
		(N'Broad Forest Trail', NULL,N'sese',NULL,NULL, N'Faroth'),
		(N'Broadening River', NULL,N'neewe',NULL,NULL, N'Faroth'),
		(N'Broken Earth', NULL,N'eeswneee',NULL,NULL, N'Faroth'),
		(N'Bundles of Trees', NULL,N'essee',NULL,NULL, N'Faroth'),
		(N'Burnt Trees', NULL,N'essewnee',N'sww',NULL, N'Faroth'),
		(N'Buzzing Woods', NULL,N'swewwe',NULL,NULL, N'Faroth'),
		(N'Burrowing Trails', NULL,N'wsneee',NULL,NULL, N'Faroth'),
		(N'Calm River', NULL,N'wneewe',NULL,NULL, N'Faroth'),
		(N'Circle of Maples', NULL,N'snewwe',NULL,NULL, N'Faroth'),
		(N'Circle of Rocks', NULL,N'snnnwwe',NULL,NULL, N'Faroth'),
		(N'Clearing in the Woods', NULL,N'newsneee',NULL,NULL, N'Faroth'),
		(N'Clear River', NULL,N'esneewe',NULL,NULL, N'Faroth'),
		(N'Confined Feeling', NULL,N'nsese',NULL,NULL, N'Faroth'),
		(N'Coniferous Trees', NULL,N'nssse',NULL,NULL, N'Faroth'),
		(N'Cracked Earth', NULL,N'wneee',NULL,NULL, N'Faroth'),
		(N'Crowded Foliage', NULL,N'sswneee',NULL,NULL, N'Faroth'),
		(N'Crumbling Woods', NULL,N'ssenewse',NULL,NULL, N'Faroth'),
		(N'Crushed Trees', NULL,N'snwewwe',NULL,NULL, N'Faroth'),
		(N'Cryptic Stones', NULL,N'nnnwwe',N'ene',NULL, N'Faroth'),
		(N'Cursed Woods', NULL,N'eswneee',N'www',NULL, N'Faroth'),
		(N'Damp Forest Floor', NULL,N'ese',NULL,NULL, N'Faroth'),
		(N'Dancing Eyes', NULL,N'wsnwnee',NULL,NULL, N'Faroth'),
		(N'Dark and Dreadful Forest', NULL,N'wese',NULL,NULL, N'Faroth'),
		(N'Dark Dreary Forest', NULL,N'sssse',NULL,NULL, N'Faroth'),
		(N'Dark Forest Path', NULL,N'nsse',NULL,NULL, N'Faroth'),
		(N'Dark River Waters', NULL,N'eseewe',NULL,NULL, N'Faroth'),
		(N'Dead Trees', NULL,N'nwwse',NULL,NULL, N'Faroth'),
		(N'Deafening Current', NULL,N'weewe',NULL,NULL, N'Faroth'),
		(N'Decorative Skeletons', NULL,N'eswnnwwe',NULL,NULL, N'Faroth'),
		(N'Decrepit Shack', NULL,N'wwnnsse',NULL,NULL, N'Faroth'),
		(N'Deep Dark Pond', NULL,N'enee',NULL,NULL, N'Faroth'),
		(N'Deepening River', NULL,N'seewe',NULL,NULL, N'Faroth'),
		(N'Deepening Waters', NULL,N'swewe',NULL,NULL, N'Faroth'),
		(N'Dense Canopy', NULL,N'enwewwe',NULL,NULL, N'Faroth'),
		(N'Dimly-lit Woods', NULL,N'ewewe',N'se',NULL, N'Faroth'),
		(N'Disappearing Trail', NULL,N'sssnnee',NULL,NULL, N'Faroth'),
		(N'Dry Forest', NULL,N'ssssse',NULL,NULL, N'Faroth'),
		(N'Echo of Silence', NULL,N'wsese',N'es',NULL, N'Faroth'),
		(N'Eerie Vapors', NULL,N'newnee',NULL,NULL, N'Faroth'),
		(N'Endless Trees', NULL,N'ewwe',N'nse',NULL, N'Faroth'),
		(N'Eryn Lasgalien', NULL,N'nwwwse',N's',NULL, N'Faroth'),
		(N'Eryn Vorn', NULL,N'ewese',NULL,NULL, N'Faroth'),
		(N'Eternal Darkness', NULL,N'wewewe',N'wse',NULL, N'Faroth'),
		(N'Faint Forest Trail', NULL,N'ewse',NULL,NULL, N'Faroth'),
		(N'Fallen Logs', NULL,N'eewwewwe',NULL,NULL, N'Faroth'),
		(N'Fields of Death', NULL,N'newsneee',N'eww',NULL, N'Faroth'),
		(N'Fiery Forest', NULL,N'enewnee',NULL,NULL, N'Faroth'),
		(N'Flowerless Fields', NULL,N'neewse',N'w',NULL, N'Faroth'),
		(N'Foggy Woods', NULL,N'nwewse',NULL,NULL, N'Faroth'),
		(N'Forest Loops', NULL,N'ssnsse',N'nsn',NULL, N'Faroth'),
		(N'Forest of Dawn', NULL,N'wwewwe',NULL,NULL, N'Faroth'),
		(N'Forest of Despair', NULL,N'ewnnsse',NULL,NULL, N'Faroth'),
		(N'Forest of Shadows', NULL,N'sewnee',NULL,NULL, N'Faroth'),
		(N'Forest of Thorns', NULL,N'wenewse',NULL,NULL, N'Faroth'),
		(N'Forest of Twilight', NULL,N'wessee',NULL,NULL, N'Faroth'),
		(N'Forested Valley', NULL,N'nnewwe',NULL,NULL, N'Faroth'),
		(N'Forgotten Forest', NULL,N'ssewnee',NULL,NULL, N'Faroth'),
		(N'Forsaken Forest', NULL,N'weewse',N'wsnes',N'nnn', N'Faroth'),
		(N'Fresh Droppings', NULL,N'nwewwe',N'ne',N'neennnn', N'Faroth'),
		(N'Furry Trees', NULL,N'snwnee',NULL,NULL, N'Faroth'),
		(N'Game Trail', NULL,N'wwse',NULL,NULL, N'Faroth'),
		(N'Gloomy Woods', NULL,N'nnsse',NULL,NULL, N'Faroth'),
		(N'Glowing Eyes', NULL,N'senewse',NULL,NULL, N'Faroth'),
		(N'Golden Leaves', NULL,N'wnwewwe',N'wne',NULL, N'Faroth'),
		(N'Grassy Knoll', NULL,N'sssnsse',NULL,NULL, N'Faroth'),
		(N'Groves of Oaks', NULL,N'eee',NULL,NULL, N'Faroth'),
		(N'Heart of Darkness', NULL,N'ewwse',NULL,NULL, N'Faroth'),
		(N'Holly Bushes', NULL,N'newnee',NULL,NULL, N'Faroth'),
		(N'Hot Geysers', NULL,N'wssnnee',N'es',NULL, N'Faroth'),
		(N'Imprinted Tracks', NULL,N'sene',NULL,NULL, N'Faroth'),
		(N'Intersecting Trails', NULL,N'eesnwnee',N'nsnn',NULL, N'Faroth'),
		(N'Intimidating Trees', NULL,N'essewnee',NULL,NULL, N'Faroth'),
		(N'Jagged Rocks', NULL,N'nsnewwe',NULL,NULL, N'Faroth'),
		(N'Layers of Leaves', NULL,N'snnwwe',NULL,NULL, N'Faroth'),
		(N'Leaving the River', NULL,N'wewe',NULL,NULL, N'Faroth'),
		(N'Looming Trees', NULL,N'ee',NULL,NULL, N'Faroth'),
		(N'Lost in the Forest', NULL,N'newse',NULL,NULL, N'Faroth'),
		(N'Lost Woods', NULL,N'wssssse',NULL,NULL, N'Faroth'),
		(N'Luminous Forest', NULL,N'snsse',N'nnn',NULL, N'Faroth'),
		(N'Marked Grave', NULL,N'eewse',N'snes',NULL, N'Faroth'),
		(N'Massive Cold Campfire', NULL,N'esnsnnee',NULL,NULL, N'Faroth'),
		(N'Massive Hives', NULL,N'snwewse',NULL,NULL, N'Faroth'),
		(N'Massive Nests', NULL,N'esnwnee',NULL,NULL, N'Faroth'),
		(N'Massive Paw Prints', NULL,N'se',NULL,NULL, N'Faroth'),
		(N'Massive Pines', NULL,N'nweewse',N'nwsnes',N'nnnn', N'Faroth'),
		(N'Menacing Trees', NULL,N'wewwe',NULL,NULL, N'Faroth'),
		(N'Misplaced Boulder', NULL,N'newwe',NULL,NULL, N'Faroth'),
		(N'Moldy Mushrooms', NULL,N'ssnnee',NULL,NULL, N'Faroth'),
		(N'Monument Hill', NULL,N'nsssse',NULL,NULL, N'Faroth'),
		(N'Moss-covered Trees', NULL,N'ne',NULL,NULL, N'Faroth'),
		(N'Motionless Trees', NULL,N'snwwse',NULL,NULL, N'Faroth'),
		(N'Mounds of Sand', NULL,N'nneewse',NULL,NULL, N'Faroth'),
		(N'Muddy Forest Trail', NULL,N'nwewe',NULL,NULL, N'Faroth'),
		(N'Muddy Riverway', NULL,N'ewneewe',NULL,NULL, N'Faroth'),
		(N'Old Willow', NULL,N'esene',NULL,NULL, N'Faroth'),
		(N'Overgrown Forest Path', NULL,N'ewnee',NULL,NULL, N'Faroth'),
		(N'Overgrown Graveyard', NULL,N'we',NULL,NULL, N'Faroth'),
		(N'Pale Mist', NULL,N'nsewnee',NULL,NULL, N'Faroth'),
		(N'Parched Forest', NULL,N'eewese',NULL,NULL, N'Faroth'),
		(N'Patches of Mushrooms', NULL,N'nwsneee',NULL,NULL, N'Faroth'),
		(N'Piles of Acorns', NULL,N'enweewe',NULL,NULL, N'Faroth'),
		(N'Placid Creek', NULL,N'ene',NULL,NULL, N'Faroth'),
		(N'Poisonous Thorns', NULL,N'wnweewe',NULL,NULL, N'Faroth'),
		(N'Pools of Blood', NULL,N'nwwwwe',NULL,NULL, N'Faroth'),
		(N'Puddles of Mud', NULL,N'nsnewwse',N'nn',NULL, N'Faroth'),
		(N'Quickening River', NULL,N'nsneee',NULL,NULL, N'Faroth'),
		(N'Rabbit Holes', NULL,N'wnnwwe',N'nnsnn',NULL, N'Faroth'),
		(N'Raging River', NULL,N'sweewe',NULL,NULL, N'Faroth'),
		(N'Rainbow Woods', NULL,N'nnwwe',NULL,NULL, N'Faroth'),
		(N'Rent Oaks', NULL,N'nwnee',NULL,N'n', N'Faroth'),
		(N'Rocky Forest Pathway', NULL,N'wewse',NULL,NULL, N'Faroth'),
		(N'Rotting Carcass', NULL,N'wnwewe',NULL,NULL, N'Faroth'),
		(N'Rows of Stumps', NULL,N'ssee',NULL,NULL, N'Faroth'),
		(N'Rustling Leaves', NULL,N'nwnwwe',NULL,NULL, N'Faroth'),
		(N'Sand Dunes', NULL,N'wneewse',N'ww',NULL, N'Faroth'),
		(N'Sandy Fields', NULL,N'sneee',NULL,NULL, N'Faroth'),
		(N'Sandy Knoll', NULL,N'wnsneee',NULL,NULL, N'Faroth'),
		(N'Scattered Bones', NULL,N'swese',NULL,NULL, N'Faroth'),
		(N'Scene of Struggle', NULL,N'ewwwwe',NULL,NULL, N'Faroth'),
		(N'Shadowed Gully', NULL,N'wnssse',NULL,NULL, N'Faroth'),
		(N'Shallow Riverway', NULL,N'sneewe',NULL,NULL, N'Faroth'),
		(N'Sharp Thorns', NULL,N'nsnnee',NULL,NULL, N'Faroth'),
		(N'Shifting Sands', NULL,N'nsneee',NULL,NULL, N'Faroth'),
		(N'Shining Waters', NULL,N'seseewe',NULL,NULL, N'Faroth'),
		(N'Silent Path', NULL,N'wnwwe',NULL,NULL, N'Faroth'),
		(N'Skeletal Trees', NULL,N'snsnnee',NULL,NULL, N'Faroth'),
		(N'Sleepy Forest', NULL,N'wewwe',N'e',NULL, N'Faroth'),
		(N'Smell of Rot', NULL,N'nnwwse',NULL,NULL, N'Faroth'),
		(N'Soft Dirt', NULL,N'swneee',NULL,NULL, N'Faroth'),
		(N'Sparkling River', NULL,N'swseewe',NULL,NULL, N'Faroth'),
		(N'Splintered Trees', NULL,N'nee',NULL,NULL, N'Faroth'),
		(N'Steep Clifface', NULL,N'nsewnee',NULL,NULL, N'Faroth'),
		(N'Stench of Blood', NULL,N'ewsneee',N'nes',NULL, N'Faroth'),
		(N'Streams of Wildflowers', NULL,N'esnewwe',N'snn',NULL, N'Faroth'),
		(N'Stuffy Woods', NULL,N'ewwe',NULL,NULL, N'Faroth'),
		(N'Swaying Treetops', NULL,N'ssewnee',NULL,NULL, N'Faroth'),
		(N'Swirling Breezes', NULL,N'nwsneee',NULL,NULL, N'Faroth'),
		(N'Swirling Waters', NULL,N'nweewe',NULL,NULL, N'Faroth'),
		(N'Tangled Roots', NULL,N'eewwse',NULL,NULL, N'Faroth'),
		(N'Tangled Underbrush', NULL,N'wewwwwe',NULL,NULL, N'Faroth'),
		(N'Taur-en-Faroth', NULL,N'e',N'nnnsnn',NULL, N'Faroth'),
		(N'Taur-im-Duinath', NULL,N'ssnnee',N'wsn',NULL, N'Faroth'),
		(N'Thick Brushcover', NULL,N'nnee',NULL,NULL, N'Faroth'),
		(N'Thick Gnarled Trees', NULL,N'weswneee',NULL,NULL, N'Faroth'),
		(N'Thin Birches', NULL,N'ensewnee',NULL,NULL, N'Faroth'),
		(N'Thinning Forest', NULL,N'sse',NULL,NULL, N'Faroth'),
		(N'Thorned Vines', NULL,N'see',NULL,NULL, N'Faroth'),
		(N'Towering Elms', NULL,N'neewese',NULL,NULL, N'Faroth'),
		(N'Tracks in the Sand', NULL,N'weewwse',NULL,NULL, N'Faroth'),
		(N'Trail of Blood', NULL,N'ewwewwe',NULL,NULL, N'Faroth'),
		(N'Trail of Drool', NULL,N'snnee',N'ees',NULL, N'Faroth'),
		(N'Twisted Branches', NULL,N'snewwse',N'n',NULL, N'Faroth'),
		(N'Twisted Roots', NULL,N'enwwwwe',NULL,NULL, N'Faroth'),
		(N'Twisting Forest Trail', NULL,N'seewnee',NULL,NULL, N'Faroth'),
		(N'Undisturbed Forest', NULL,N'wwwe',NULL,NULL, N'Faroth'),
		(N'Uneven Forest Floor', NULL,N'wwwse',NULL,NULL, N'Faroth'),
		(N'Vacant Treetops', NULL,N'ssse',NULL,NULL, N'Faroth'),
		(N'Vanishing Forest Trail', NULL,N'wse',NULL,NULL, N'Faroth'),
		(N'Vine-covered River', NULL,N'nsee',NULL,NULL, N'Faroth'),
		(N'Walls of Cones', NULL,N'nesene',NULL,NULL, N'Faroth'),
		(N'Wall of Rock', NULL,N'newwse',NULL,NULL, N'Faroth'),
		(N'Wall of Vines', NULL,N'wwe',NULL,NULL, N'Faroth'),
		(N'Warm Breeze', NULL,N'enewse',NULL,NULL, N'Faroth'),
		(N'Waves of Sand', NULL,N'ewsneee',NULL,NULL, N'Faroth'),
		(N'Webbed Trees', NULL,N'ewewewe',NULL,NULL, N'Faroth'),
		(N'Weedy Path', NULL,N'eewnee',NULL,NULL, N'Faroth'),
		(N'Wet Forest', NULL,N'nsssnsse',NULL,NULL, N'Faroth'),
		(N'Whispering Trees', NULL,N'nnwnee',NULL,N'nn', N'Faroth'),
		(N'Wild Brush', NULL,N'wnewwe',NULL,NULL, N'Faroth'),
		(N'Withered Branches', NULL,N'neee',N'www',NULL, N'Faroth')
END


USE [master]
GO