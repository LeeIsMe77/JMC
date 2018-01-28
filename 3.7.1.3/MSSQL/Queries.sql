USE [RotS]
GO

SELECT
		I.ItemName,
		I.Usage,
		I.ItemType,
		I.Material,
		I.Attributes,
		I.Affections
	FROM dbo.Item I
	WHERE 1 = 1
		--AND I.ItemName LIKE N'%chain%'
	--  AND I.ItemName LIKE N'%blue and gold%'
	--	AND I.ItemType = N'piece of armour'
	--	AND (I.ItemName LIKE N'%chain%' OR I.ItemName LIKE N'%mithril%')
	ORDER BY I.Usage, I.ItemName

USE [RotS]
GO

SELECT
		*
	FROM dbo.Item I
	WHERE 1 = 1
	--ORDER BY I.Usage, I.ItemName
		AND I.Usage = N'wielded'
		--AND I.ItemName LIKE N'%bastard%'
	ORDER BY I.DamageRating DESC