-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: EfA
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adminAccounts`
--

DROP TABLE IF EXISTS `adminAccounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adminAccounts` (
  `username` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `name` longtext NOT NULL,
  `password` longtext NOT NULL,
  `permissions` longtext,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `entryLogs`
--

DROP TABLE IF EXISTS `entryLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entryLogs` (
  `id` varchar(50) DEFAULT NULL,
  `logTime` varchar(45) DEFAULT NULL,
  `entitlement` varchar(1) DEFAULT NULL,
  `cardId` varchar(45) DEFAULT NULL,
  `date` varchar(45) DEFAULT NULL,
  `randId` int NOT NULL AUTO_INCREMENT,
  `logLocation` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`randId`),
  UNIQUE KEY `randId_UNIQUE` (`randId`)
) ENGINE=InnoDB AUTO_INCREMENT=12126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `receiverCards`
--

DROP TABLE IF EXISTS `receiverCards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receiverCards` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `receivers`
--

DROP TABLE IF EXISTS `receivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receivers` (
  `id` varchar(45) NOT NULL,
  `phonenumber` varchar(45) DEFAULT NULL,
  `passportType` varchar(15) DEFAULT NULL,
  `passportNumber` longtext,
  `birthdate` varchar(45) DEFAULT NULL,
  `fullName` longtext,
  `gender` varchar(12) DEFAULT NULL,
  `familyMembers` int DEFAULT NULL,
  `postalCode` varchar(45) DEFAULT NULL,
  `cardId` int DEFAULT NULL,
  `timeslot` varchar(15) DEFAULT NULL,
  `entitlement` varchar(1) DEFAULT NULL,
  `comment` longtext,
  `blocked` tinyint DEFAULT '0',
  `activeRegistration` tinyint DEFAULT '0',
  `registrationDate` varchar(45) DEFAULT NULL,
  `registrationLocation` varchar(45) DEFAULT NULL,
  `paid` tinyint DEFAULT '1',
  `registrator` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `receiversZemis`
--

DROP TABLE IF EXISTS `receiversZemis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receiversZemis` (
  `id1` int NOT NULL AUTO_INCREMENT,
  `receiverId` varchar(45) NOT NULL,
  `zemisNr` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `name` longtext,
  `birthdate` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id1`)
) ENGINE=InnoDB AUTO_INCREMENT=3878 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registrationLog`
--

DROP TABLE IF EXISTS `registrationLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrationLog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `body` longtext,
  `timestamp` varchar(200) DEFAULT NULL,
  `sender` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=179 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `volunteerCards`
--

DROP TABLE IF EXISTS `volunteerCards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteerCards` (
  `id` int NOT NULL,
  `name` longtext,
  `createdAt` varchar(100) DEFAULT NULL,
  `coordinator` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `comment` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `volunteerCardsLog`
--

DROP TABLE IF EXISTS `volunteerCardsLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteerCardsLog` (
  `firstLog` varchar(100) DEFAULT NULL,
  `secondLog` varchar(100) DEFAULT NULL,
  `cardID` varchar(100) DEFAULT NULL,
  `complete` tinyint DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `date` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=458 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `volunteerDates`
--

DROP TABLE IF EXISTS `volunteerDates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteerDates` (
  `id` int NOT NULL,
  `date` varchar(45) DEFAULT NULL,
  `sz` tinyint DEFAULT NULL,
  `gr` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `volunteerPasses`
--

DROP TABLE IF EXISTS `volunteerPasses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteerPasses` (
  `id` varchar(100) NOT NULL,
  `fullName` longtext,
  `email` varchar(100) DEFAULT NULL,
  `password` longtext,
  `lastLogin` varchar(100) DEFAULT NULL,
  `emailVerified` varchar(100) DEFAULT NULL,
  `mainLocation` varchar(100) DEFAULT NULL,
  `createdAt` varchar(100) DEFAULT NULL,
  `profilePictureUpdate` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `volunteerShifts`
--

DROP TABLE IF EXISTS `volunteerShifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteerShifts` (
  `date` varchar(45) NOT NULL,
  `shiftssz` json DEFAULT NULL,
  `shiftsgr` json DEFAULT NULL,
  `shiftsgl` json DEFAULT NULL,
  PRIMARY KEY (`date`),
  UNIQUE KEY `date_UNIQUE` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `volunteers`
--

DROP TABLE IF EXISTS `volunteers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteers` (
  `id` varchar(80) NOT NULL,
  `name` longtext,
  `email` longtext,
  `shifts` json DEFAULT NULL,
  `comment` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-24 16:56:15
