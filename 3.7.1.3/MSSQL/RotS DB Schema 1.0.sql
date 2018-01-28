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

IF OBJECT_ID(N'dbo.Item') IS NULL BEGIN
	CREATE TABLE dbo.[Item] (
		ItemID int NOT NULL IDENTITY(1,1),
		ItemName varchar(128) NOT NULL,
		ItemType varchar(128) NOT NULL,
		Usage varchar(128) NULL,
		[Description] varchar(1024) NULL,
		Material varchar(128) NOT NULL,
		[DamageRating] numeric(18, 2) NOT NULL CONSTRAINT dvItem_DamageRating DEFAULT 0.0,
		[Weight] numeric(18, 2) NOT NULL CONSTRAINT dvItem_Weight DEFAULT 0.0,
		Absorbtion int NOT NULL CONSTRAINT dvItem_Absorbtion DEFAULT 0,
		MinimumAbsorbtion int NOT NULL CONSTRAINT dvItem_MinimumAbsorbtion DEFAULT 0,
		Encumberance int NOT NULL CONSTRAINT dvItem_Encumberance DEFAULT 0,
		OffensiveBonus int NOT NULL CONSTRAINT dvItem_OffensiveBonus DEFAULT 0,
		Dodge int NOT NULL CONSTRAINT dvItem_Dodge DEFAULT 0,
		Parry int NOT NULL CONSTRAINT dvItem_Parry DEFAULT 0,
		[Bulk] int NOT NULL CONSTRAINT dvItem_Bulk DEFAULT 0,
		ToHit int NOT NULL CONSTRAINT dvItem_ToHit DEFAULT 0,
		ToDamage int NOT NULL CONSTRAINT dvItem_ToDamage DEFAULT 0,
		BreakPercentage int NOT NULL CONSTRAINT dvItem_BreakPercentage DEFAULT 0,
		Capacity int NOT NULL CONSTRAINT dvItem_Capacity DEFAULT 0,
		Attributes varchar(1024) NULL,
		Affections varchar(1024) NULL,
		DateCreated datetime NOT NULL CONSTRAINT dvItem_DateCreated DEFAULT CURRENT_TIMESTAMP,
		DateUpdated datetime NOT NULL CONSTRAINT dvItem_DateUpdated DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT pkItem PRIMARY KEY CLUSTERED (ItemID),
		CONSTRAINT ukItem_ItemName UNIQUE (ItemName)
	);
END;
GO

IF OBJECT_ID(N'dbo.Mobile') IS NULL BEGIN
	CREATE TABLE dbo.[Mobile] (
		MobileID int NOT NULL IDENTITY(1,1),
		MobileName varchar(128) NOT NULL,
		[Description] varchar(1024) NOT NULL CONSTRAINT dvMobile_Description DEFAULT N'Coming Soon...',
		[Location] varchar(512) NOT NULL CONSTRAINT dvMobile_Location DEFAULT N'Coming Soon...',
		DateCreated datetime NOT NULL CONSTRAINT dvMobile_DateCreated DEFAULT CURRENT_TIMESTAMP,
		DateUpdated datetime NOT NULL CONSTRAINT dvMobile_DateUpdated DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT pkMobile PRIMARY KEY CLUSTERED (MobileID),
		CONSTRAINT ukMobile_MobileName UNIQUE (MobileName)
	);
END;
GO

IF OBJECT_ID(N'dbo.MobileRequest') IS NULL BEGIN
	CREATE TABLE dbo.[MobileRequest] (
		MobileID int NOT NULL IDENTITY(1,1),
		MobileName varchar(128) NOT NULL,
		Requestor varchar(128) NOT NULL,
		DateCreated datetime NOT NULL CONSTRAINT dvMobileRequest_DateCreated DEFAULT CURRENT_TIMESTAMP,
		DateUpdated datetime NOT NULL CONSTRAINT dvMobileRequest_DateUpdated DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT pkMobileRequest PRIMARY KEY CLUSTERED (MobileID),
		CONSTRAINT ukMobileRequest_MobileName UNIQUE (MobileName)
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

IF INDEXPROPERTY(OBJECT_ID(N'dbo.Item'), N'ixItem_ItemName', N'IndexID') IS NULL BEGIN
	CREATE NONCLUSTERED INDEX ixItem_ItemName
		ON dbo.[Item] (ItemID)
		INCLUDE (ItemName);
END;
GO

IF INDEXPROPERTY(OBJECT_ID(N'dbo.Mobile'), N'ixMobile_MobileName', N'IndexID') IS NULL BEGIN
	CREATE NONCLUSTERED INDEX ixMobile_MobileName
		ON dbo.[Mobile] (MobileID)
		INCLUDE (MobileName);
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

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[ItemCollection.Add]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[ItemCollection.Add] (
	@ItemName varchar(128) = NULL,
	@ItemType varchar(128) = NULL,
	@Usage varchar(128) = NULL,
	@Description varchar(1024) NULL,
	@Material varchar(128) NULL,
	@DamageRating numeric(18,2) = NULL,
	@Weight numeric(18,2) = NULL,
	@Absorbtion int = NULL,
	@MinimumAbsorbtion int = NULL,
	@Encumberance int = NULL,
	@OffensiveBonus int = NULL,
	@Dodge int = NULL,
	@Parry int = NULL,
	@Bulk int = NULL,
	@ToHit int = NULL,
	@ToDamage int = NULL,
	@BreakPercentage int = NULL,
	@Capacity int = NULL,
	@Attributes varchar(1024) NULL,
	@Affections varchar(1024) NULL,
	@ItemID int = NULL OUTPUT
) AS BEGIN
	SET NOCOUNT ON;
	DECLARE @InsertedIDs TABLE (InsertedID int NOT NULL);
	
	IF NULLIF(@ItemName, N'') IS NULL BEGIN
		RAISERROR(N'An item name must be provided.', 16, 1);
		RETURN @@ERROR;
	END
		
	IF NULLIF(@ItemType, N'') IS NULL BEGIN
		RAISERROR(N'An item type must be provided.', 16, 1);
		RETURN @@ERROR;
	END
	
	IF NULLIF(@Material, N'') IS NULL BEGIN
		RAISERROR(N'A material must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF @Weight IS NULL BEGIN
		RAISERROR(N'A weight must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF @Absorbtion IS NULL BEGIN
		RAISERROR(N'An absorbtion amount must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF @MinimumAbsorbtion IS NULL BEGIN
		RAISERROR(N'A minimum absorbtion amount must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF @Encumberance IS NULL BEGIN
		RAISERROR(N'An encumberance amount must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF @Dodge IS NULL BEGIN
		RAISERROR(N'A dodge amount must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF EXISTS (
		SELECT 1
			FROM dbo.[Item] A
			WHERE 1=1
				AND A.ItemName = @ItemName
	) BEGIN
		RAISERROR(N'The item name ''%s'' already exists.', 16, 1, @ItemName);
		RETURN @@ERROR;
	END
		
	INSERT dbo.[Item] (ItemName, ItemType, Usage, [Description], Material, [DamageRating], [Weight], Absorbtion, MinimumAbsorbtion, Encumberance, OffensiveBonus, Dodge, Parry, [Bulk], ToHit, ToDamage, BreakPercentage, Capacity, Attributes, Affections)
		OUTPUT INSERTED.ItemID INTO @InsertedIDs (InsertedID)
		VALUES (@ItemName, @ItemType, NULLIF(@Usage, N''), NULLIF(@Description, N''), @Material, @DamageRating, @Weight, @Absorbtion, @MinimumAbsorbtion, @Encumberance, @OffensiveBonus, @Dodge, @Parry, @Bulk, @ToHit, @ToDamage, @BreakPercentage, @Capacity, NULLIF(@Attributes, N''), NULLIF(@Affections, N''))

	SELECT @ItemID = InsertedID
		FROM @InsertedIDs

	RETURN @@ERROR
END;
GO

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

ALTER PROCEDURE dbo.[CharacterCollection.Enumerate] (
	@Results int = NULL,
	@CharacterOrderByType varchar(100) = NULL
) AS BEGIN
	SET NOCOUNT ON;

	IF @Results IS NULL BEGIN
		SELECT @Results = COUNT(*) FROM dbo.[Character]
	END

	SELECT TOP (@Results)
			C.CharacterID AS CharacterID,
			C.CharacterName AS CharacterName,
			C.Race AS Race,
			C.[Level] AS [Level],
			C.XPNeededToLevel AS XPNeededToLevel,
			C.DateUpdated AS [LastLogon]
		FROM dbo.[Character] C
		ORDER BY
			CASE ISNULL(@CharacterOrderByType, N'') 
				WHEN N'CharacterID' THEN C.CharacterID
				WHEN N'CharacterName' THEN C.CharacterName 
				WHEN N'Race' THEN C.Race
				WHEN N'Level' THEN C.[Level]
				WHEN N'XPNeededToLevel' THEN C.XPNeededToLevel
				ELSE C.DateUpdated
			END DESC				
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

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[ItemCollection.Enumerate]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[ItemCollection.Enumerate] AS BEGIN
	SET NOCOUNT ON;

	SELECT
			I.ItemID,
			I.ItemName,
			I.ItemType,
			I.Usage,
			I.[Description],
			I.Material,
			I.DamageRating,
			I.[Weight],
			I.Absorbtion,
			I.MinimumAbsorbtion,
			I.Encumberance,
			I.OffensiveBonus,
			I.Dodge,
			I.Parry,
			I.[Bulk],
			I.ToHit,
			I.ToDamage,
			I.BreakPercentage,
			I.Capacity,
			I.Attributes,
			I.Affections,
			I.DateCreated,
			I.DateUpdated
		FROM dbo.Item I

	RETURN @@ERROR;
END;
GO

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[MobileCollection.Find]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[MobileCollection.Find] (
	@MobileName varchar(128)
) AS BEGIN
	SET NOCOUNT ON;

	IF NULLIF(@MobileName, '') IS NULL BEGIN
		RAISERROR(N'A mobile name must be provided.', 16, 1);
		RETURN @@ERROR;
	END
	
	SELECT
			M.MobileName,
			M.[Description],
			M.[Location]
		FROM dbo.Mobile M
		WHERE 1=1
			AND M.MobileName LIKE  N'%' + @MobileName + N'%'
		ORDER BY DIFFERENCE(M.MobileName, @MobileName) DESC

	RETURN @@ERROR;
END;
GO

DECLARE @ProcedureName sysname SET @ProcedureName = N'dbo.[MobileCollection.Request]';
IF OBJECT_ID(@ProcedureName) IS NULL BEGIN
	EXECUTE(N'CREATE PROCEDURE ' + @ProcedureName + N' AS PRINT @@VERSION;');
	EXECUTE(N'GRANT EXEC ON ' + @ProcedureName + N' TO JMCMudClient;');
END;
GO

ALTER PROCEDURE dbo.[MobileCollection.Request] (
	@MobileName varchar(128),
	@Requestor varchar(128)
) AS BEGIN
	SET NOCOUNT ON;

	IF NULLIF(@MobileName, '') IS NULL BEGIN
		RAISERROR(N'A mobile name must be provided.', 16, 1);
		RETURN @@ERROR;
	END

	IF NOT EXISTS (SELECT 1 FROM dbo.MobileRequest MR WHERE MR.MobileName = @MobileName) BEGIN
		INSERT dbo.MobileRequest (MobileName, Requestor)
			VALUES (@MobileName, @Requestor)
	END	
	RETURN @@ERROR;
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