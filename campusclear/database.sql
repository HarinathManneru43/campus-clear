-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: campusclear_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'SYSTEM_INITIALIZATION','DATABASE',1,'CampusClear Database Initialized with Default Seed Data','127.0.0.1','2026-09-10 02:07:41'),(2,NULL,'LOGIN_FAILED','USER',NULL,'Failed login attempt for: admin','::1','2026-09-10 02:16:47'),(3,1,'LOGIN_SUCCESS','USER',1,'Admin Login Successful','::1','2026-09-10 02:22:48'),(4,2,'LOGIN_SUCCESS','USER',2,'Staff Login Successful','::1','2026-09-10 02:22:48'),(7,1,'LOGIN_SUCCESS','USER',1,'Admin Login Successful','::1','2026-09-10 02:23:10'),(8,2,'LOGIN_SUCCESS','USER',2,'Staff Login Successful','::1','2026-09-10 02:23:10'),(12,2,'LOGIN_SUCCESS','USER',2,'Staff Login Successful','::1','2026-09-10 02:23:47'),(13,1,'LOGIN_SUCCESS','USER',1,'Admin Login Successful','::1','2026-09-10 02:23:48'),(14,1,'LOGIN_SUCCESS','USER',1,'Admin Login Successful','::1','2026-09-10 02:27:46'),(15,1,'LOGOUT','USER',1,'User Logged Out','::1','2026-09-10 02:30:17'),(16,1,'LOGIN_SUCCESS','USER',1,'Admin Login Successful','::1','2026-09-10 02:30:25'),(17,1,'LOGOUT','USER',1,'User Logged Out','::1','2026-09-10 02:31:24'),(18,NULL,'LOGIN_FAILED','USER',NULL,'Failed login attempt for: STU2026001','::1','2026-09-10 02:32:03'),(21,1,'LOGIN_SUCCESS','USER',1,'Admin Login Successful','::1','2026-09-10 02:36:27'),(22,41,'LOGIN_SUCCESS','USER',41,'Student Login Successful','::1','2026-09-10 02:38:02'),(23,10,'LOGIN_SUCCESS','USER',10,'Student Login Successful','::1','2026-09-10 02:38:03'),(25,2,'LOGIN_SUCCESS','USER',2,'Staff Login Successful','::1','2026-09-10 02:38:26'),(26,1,'LOGIN_SUCCESS','USER',1,'Admin Login Successful','::1','2026-09-10 02:38:27'),(27,1,'LOGOUT','USER',1,'User Logged Out','::1','2026-09-10 02:39:24'),(28,41,'LOGIN_SUCCESS','USER',41,'Student Login Successful','::1','2026-09-10 02:39:43'),(29,41,'LOGIN_SUCCESS','USER',41,'Student Login Successful','::1','2026-09-10 05:25:37'),(30,41,'LOGOUT','USER',41,'User Logged Out','::1','2026-09-10 05:28:37'),(31,1,'LOGIN_SUCCESS','USER',1,'Admin Login Successful','::1','2026-09-10 05:28:42');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clearance_history`
--

DROP TABLE IF EXISTS `clearance_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clearance_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `previous_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) NOT NULL,
  `remarks` text DEFAULT NULL,
  `updated_by_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `department_id` (`department_id`),
  KEY `updated_by_user_id` (`updated_by_user_id`),
  CONSTRAINT `clearance_history_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `clearance_history_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `clearance_history_ibfk_3` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clearance_history`
--

LOCK TABLES `clearance_history` WRITE;
/*!40000 ALTER TABLE `clearance_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `clearance_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clearance_status`
--

DROP TABLE IF EXISTS `clearance_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clearance_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `status` enum('cleared','pending','blocked') DEFAULT 'cleared',
  `remarks` text DEFAULT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_dept` (`student_id`,`department_id`),
  KEY `department_id` (`department_id`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `clearance_status_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `clearance_status_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `clearance_status_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=456 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clearance_status`
--

LOCK TABLES `clearance_status` WRITE;
/*!40000 ALTER TABLE `clearance_status` DISABLE KEYS */;
INSERT INTO `clearance_status` VALUES (22,4,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:36:58'),(23,4,2,'pending','Accounts: Lab Maintenance Fee Pending',1,'2026-09-10 02:36:58'),(24,4,3,'pending','Hostel: Room Key Return Verification',1,'2026-09-10 02:36:58'),(25,4,4,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(26,4,5,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(27,4,6,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(28,4,7,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(29,5,1,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(30,5,2,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(31,5,3,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(32,5,4,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(33,5,5,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(34,5,6,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(35,5,7,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(36,6,1,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(37,6,2,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(38,6,3,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(39,6,4,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(40,6,5,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(41,6,6,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(42,6,7,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(43,7,1,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(44,7,2,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(45,7,3,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(46,7,4,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(47,7,5,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(48,7,6,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(49,7,7,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(50,8,1,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(51,8,2,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(52,8,3,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(53,8,4,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(54,8,5,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(55,8,6,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(56,8,7,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(57,9,1,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(58,9,2,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(59,9,3,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(60,9,4,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(61,9,5,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(62,9,6,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(63,9,7,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(64,10,1,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(65,10,2,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(66,10,3,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(67,10,4,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(68,10,5,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(69,10,6,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(70,10,7,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(71,11,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:36:58'),(72,11,2,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(73,11,3,'cleared','No pending issues',1,'2026-09-10 02:36:58'),(74,11,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(75,11,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(76,11,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(77,11,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(78,12,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(79,12,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(80,12,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(81,12,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(82,12,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(83,12,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(84,12,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(85,13,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(86,13,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(87,13,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(88,13,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(89,13,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(90,13,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(91,13,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(92,14,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(93,14,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(94,14,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(95,14,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(96,14,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(97,14,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(98,14,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(99,15,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(100,15,2,'pending','Accounts: Lab Maintenance Fee Pending',1,'2026-09-10 02:36:59'),(101,15,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(102,15,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(103,15,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(104,15,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(105,15,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(106,16,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(107,16,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(108,16,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(109,16,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(110,16,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(111,16,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(112,16,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(113,17,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(114,17,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(115,17,3,'pending','Hostel: Room Key Return Verification',1,'2026-09-10 02:36:59'),(116,17,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(117,17,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(118,17,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(119,17,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(120,18,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:36:59'),(121,18,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(122,18,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(123,18,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(124,18,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(125,18,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(126,18,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(127,19,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(128,19,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(129,19,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(130,19,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(131,19,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(132,19,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(133,19,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(134,20,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(135,20,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(136,20,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(137,20,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(138,20,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(139,20,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(140,20,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(141,21,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(142,21,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(143,21,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(144,21,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(145,21,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(146,21,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(147,21,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(148,22,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(149,22,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(150,22,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(151,22,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(152,22,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(153,22,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(154,22,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(155,23,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(156,23,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(157,23,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(158,23,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(159,23,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(160,23,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(161,23,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(162,24,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(163,24,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(164,24,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(165,24,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(166,24,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(167,24,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(168,24,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(169,25,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:36:59'),(170,25,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(171,25,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(172,25,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(173,25,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(174,25,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(175,25,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(176,26,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(177,26,2,'pending','Accounts: Lab Maintenance Fee Pending',1,'2026-09-10 02:36:59'),(178,26,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(179,26,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(180,26,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(181,26,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(182,26,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(183,27,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(184,27,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(185,27,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(186,27,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(187,27,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(188,27,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(189,27,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(190,28,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(191,28,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(192,28,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(193,28,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(194,28,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(195,28,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(196,28,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(197,29,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(198,29,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(199,29,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(200,29,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(201,29,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(202,29,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(203,29,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(204,30,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(205,30,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(206,30,3,'pending','Hostel: Room Key Return Verification',1,'2026-09-10 02:36:59'),(207,30,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(208,30,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(209,30,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(210,30,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(211,31,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(212,31,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(213,31,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(214,31,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(215,31,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(216,31,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(217,31,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(218,32,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:36:59'),(219,32,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(220,32,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(221,32,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(222,32,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(223,32,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(224,32,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(225,33,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(226,33,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(227,33,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(228,33,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(229,33,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(230,33,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(231,33,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(232,34,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(233,34,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(234,34,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(235,34,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(236,34,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(237,34,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(238,34,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(239,35,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(240,35,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(241,35,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(242,35,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(243,35,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(244,35,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(245,35,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(246,36,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(247,36,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(248,36,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(249,36,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(250,36,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(251,36,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(252,36,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(253,37,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(254,37,2,'pending','Accounts: Lab Maintenance Fee Pending',1,'2026-09-10 02:36:59'),(255,37,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(256,37,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(257,37,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(258,37,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(259,37,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(260,38,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(261,38,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(262,38,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(263,38,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(264,38,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(265,38,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(266,38,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(267,39,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:36:59'),(268,39,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(269,39,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(270,39,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(271,39,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(272,39,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(273,39,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(274,40,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(275,40,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(276,40,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(277,40,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(278,40,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(279,40,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(280,40,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(281,41,1,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(282,41,2,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(283,41,3,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(284,41,4,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(285,41,5,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(286,41,6,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(287,41,7,'cleared','No pending issues',1,'2026-09-10 02:36:59'),(288,42,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(289,42,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(290,42,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(291,42,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(292,42,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(293,42,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(294,42,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(295,43,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(296,43,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(297,43,3,'pending','Hostel: Room Key Return Verification',1,'2026-09-10 02:37:00'),(298,43,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(299,43,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(300,43,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(301,43,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(302,44,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(303,44,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(304,44,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(305,44,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(306,44,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(307,44,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(308,44,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(309,45,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(310,45,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(311,45,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(312,45,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(313,45,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(314,45,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(315,45,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(316,46,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:37:00'),(317,46,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(318,46,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(319,46,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(320,46,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(321,46,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(322,46,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(323,47,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(324,47,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(325,47,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(326,47,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(327,47,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(328,47,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(329,47,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(330,48,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(331,48,2,'pending','Accounts: Lab Maintenance Fee Pending',1,'2026-09-10 02:37:00'),(332,48,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(333,48,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(334,48,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(335,48,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(336,48,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(337,49,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(338,49,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(339,49,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(340,49,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(341,49,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(342,49,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(343,49,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(344,50,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(345,50,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(346,50,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(347,50,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(348,50,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(349,50,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(350,50,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(351,51,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(352,51,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(353,51,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(354,51,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(355,51,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(356,51,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(357,51,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(358,52,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(359,52,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(360,52,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(361,52,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(362,52,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(363,52,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(364,52,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(365,53,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:37:00'),(366,53,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(367,53,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(368,53,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(369,53,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(370,53,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(371,53,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(372,54,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(373,54,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(374,54,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(375,54,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(376,54,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(377,54,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(378,54,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(379,55,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(380,55,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(381,55,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(382,55,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(383,55,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(384,55,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(385,55,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(386,56,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(387,56,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(388,56,3,'pending','Hostel: Room Key Return Verification',1,'2026-09-10 02:37:00'),(389,56,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(390,56,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(391,56,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(392,56,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(393,57,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(394,57,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(395,57,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(396,57,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(397,57,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(398,57,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(399,57,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(400,58,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(401,58,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(402,58,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(403,58,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(404,58,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(405,58,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(406,58,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(407,59,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(408,59,2,'pending','Accounts: Lab Maintenance Fee Pending',1,'2026-09-10 02:37:00'),(409,59,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(410,59,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(411,59,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(412,59,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(413,59,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(414,60,1,'pending','Library Due: 1 Reference Book Overdue',1,'2026-09-10 02:37:00'),(415,60,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(416,60,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(417,60,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(418,60,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(419,60,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(420,60,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(421,61,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(422,61,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(423,61,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(424,61,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(425,61,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(426,61,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(427,61,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(428,62,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(429,62,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(430,62,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(431,62,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(432,62,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(433,62,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(434,62,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(435,63,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(436,63,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(437,63,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(438,63,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(439,63,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(440,63,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(441,63,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(442,64,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(443,64,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(444,64,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(445,64,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(446,64,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(447,64,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(448,64,7,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(449,65,1,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(450,65,2,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(451,65,3,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(452,65,4,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(453,65,5,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(454,65,6,'cleared','No pending issues',1,'2026-09-10 02:37:00'),(455,65,7,'cleared','No pending issues',1,'2026-09-10 02:37:00');
/*!40000 ALTER TABLE `clearance_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Central Library','LIB','University Central Library & E-Resource Center',1,'2026-09-10 02:07:41'),(2,'Accounts & Finance','ACC','Student Tuition Fees, Exam Fees & Financial Services',1,'2026-09-10 02:07:41'),(3,'Hostel Administration','HST','Student Housing, Mess & Warden Clearances',1,'2026-09-10 02:07:41'),(4,'Computer Science & Engineering','CSE','Academic Department for CSE Students',1,'2026-09-10 02:07:41'),(5,'Electronics & Comm Engineering','ECE','Academic Department for ECE Students',1,'2026-09-10 02:07:41'),(6,'Central Laboratories','LAB','Physics, Chemistry & Hardware Research Labs',1,'2026-09-10 02:07:41'),(7,'Examination Cell','EXM','University Semester Examinations & Transcripts Cell',1,'2026-09-10 02:07:41');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disputes`
--

DROP TABLE IF EXISTS `disputes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disputes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `due_id` int(11) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `subject` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','under_review','resolved','rejected') DEFAULT 'open',
  `resolution_remarks` text DEFAULT NULL,
  `resolved_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `due_id` (`due_id`),
  KEY `department_id` (`department_id`),
  KEY `resolved_by_user_id` (`resolved_by_user_id`),
  CONSTRAINT `disputes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `disputes_ibfk_2` FOREIGN KEY (`due_id`) REFERENCES `dues` (`id`) ON DELETE SET NULL,
  CONSTRAINT `disputes_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `disputes_ibfk_4` FOREIGN KEY (`resolved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disputes`
--

LOCK TABLES `disputes` WRITE;
/*!40000 ALTER TABLE `disputes` DISABLE KEYS */;
/*!40000 ALTER TABLE `disputes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dues`
--

DROP TABLE IF EXISTS `dues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','resolved','waived') DEFAULT 'pending',
  `added_by_staff_id` int(11) NOT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by_staff_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `department_id` (`department_id`),
  KEY `added_by_staff_id` (`added_by_staff_id`),
  KEY `resolved_by_staff_id` (`resolved_by_staff_id`),
  CONSTRAINT `dues_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dues_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `dues_ibfk_3` FOREIGN KEY (`added_by_staff_id`) REFERENCES `staff` (`id`),
  CONSTRAINT `dues_ibfk_4` FOREIGN KEY (`resolved_by_staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dues`
--

LOCK TABLES `dues` WRITE;
/*!40000 ALTER TABLE `dues` DISABLE KEYS */;
INSERT INTO `dues` VALUES (4,4,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:36:58','2026-09-10 02:36:58'),(5,11,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:36:59','2026-09-10 02:36:59'),(6,15,2,'Lab Maintenance Fee','Semester 4 Hardware Lab Kit Fee',1200.00,'pending',2,NULL,NULL,'2026-09-10 02:36:59','2026-09-10 02:36:59'),(7,18,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:36:59','2026-09-10 02:36:59'),(8,25,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:36:59','2026-09-10 02:36:59'),(9,26,2,'Lab Maintenance Fee','Semester 4 Hardware Lab Kit Fee',1200.00,'pending',2,NULL,NULL,'2026-09-10 02:36:59','2026-09-10 02:36:59'),(10,32,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:36:59','2026-09-10 02:36:59'),(11,37,2,'Lab Maintenance Fee','Semester 4 Hardware Lab Kit Fee',1200.00,'pending',2,NULL,NULL,'2026-09-10 02:36:59','2026-09-10 02:36:59'),(12,39,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:36:59','2026-09-10 02:36:59'),(13,46,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:37:00','2026-09-10 02:37:00'),(14,48,2,'Lab Maintenance Fee','Semester 4 Hardware Lab Kit Fee',1200.00,'pending',2,NULL,NULL,'2026-09-10 02:37:00','2026-09-10 02:37:00'),(15,53,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:37:00','2026-09-10 02:37:00'),(16,59,2,'Lab Maintenance Fee','Semester 4 Hardware Lab Kit Fee',1200.00,'pending',2,NULL,NULL,'2026-09-10 02:37:00','2026-09-10 02:37:00'),(17,60,1,'Overdue Library Book','Database Management Systems 8th Edition',350.00,'pending',1,NULL,NULL,'2026-09-10 02:37:00','2026-09-10 02:37:00');
/*!40000 ALTER TABLE `dues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `type` varchar(30) DEFAULT 'general',
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request_approvals`
--

DROP TABLE IF EXISTS `request_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `request_approvals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `remarks` text DEFAULT NULL,
  `action_by_user_id` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_request_dept` (`request_id`,`department_id`),
  KEY `department_id` (`department_id`),
  KEY `action_by_user_id` (`action_by_user_id`),
  CONSTRAINT `request_approvals_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `service_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `request_approvals_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `request_approvals_ibfk_3` FOREIGN KEY (`action_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_approvals`
--

LOCK TABLES `request_approvals` WRITE;
/*!40000 ALTER TABLE `request_approvals` DISABLE KEYS */;
/*!40000 ALTER TABLE `request_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_categories`
--

DROP TABLE IF EXISTS `service_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `requires_full_clearance` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES (1,'End-Semester Exam Hall Ticket','Clearance required to generate examination hall ticket',1,1,'2026-09-10 02:07:41'),(2,'Bonafide Student Certificate','Official certificate for passport, bank loan, or external purpose',1,1,'2026-09-10 02:07:41'),(3,'Semester Fee Payment Clearance','Permission to register for upcoming semester',0,1,'2026-09-10 02:07:41'),(4,'Library No-Due Certificate','Special clearance for library membership renewal or book return receipt',0,1,'2026-09-10 02:07:41'),(5,'Hostel Clearance Certificate','Clearance certificate for hostel room vacate',0,1,'2026-09-10 02:07:41'),(6,'Transfer & Character Certificate','Official transfer certificate upon graduation or course exit',1,1,'2026-09-10 02:07:41'),(7,'Duplicate ID Card Reissue','Re-issuance of lost or damaged college identity card',0,1,'2026-09-10 02:07:41');
/*!40000 ALTER TABLE `service_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_requests`
--

DROP TABLE IF EXISTS `service_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_number` varchar(40) NOT NULL,
  `student_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `status` enum('submitted','in_progress','approved','rejected','cancelled') DEFAULT 'submitted',
  `clearance_snapshot` enum('cleared','pending') NOT NULL,
  `qr_token` varchar(100) NOT NULL,
  `admin_remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  UNIQUE KEY `qr_token` (`qr_token`),
  KEY `student_id` (`student_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `service_requests_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `service_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_requests`
--

LOCK TABLES `service_requests` WRITE;
/*!40000 ALTER TABLE `service_requests` DISABLE KEYS */;
INSERT INTO `service_requests` VALUES (3,'REQ-2026-001',35,2,'Required for Education Loan & Scholarship Documentation','approved','cleared','TOKEN_HARINATH_BONAFIDE_2026','Approved by University Academic Section','2026-09-10 05:33:03','2026-09-10 05:33:03');
/*!40000 ALTER TABLE `service_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `staff_code` varchar(30) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `staff_code` (`staff_code`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,2,'STF-LIB-01','Dr. Ramesh Chandra','library@campusclear.edu','9876543210',1,'Chief Librarian','2026-09-10 02:07:41'),(2,3,'STF-ACC-01','Mrs. Sunita Verma','accounts@campusclear.edu','9876543211',2,'Finance Officer','2026-09-10 02:07:41'),(3,4,'STF-HST-01','Mr. Rajesh Singh','hostel@campusclear.edu','9876543212',3,'Chief Hostel Warden','2026-09-10 02:07:41'),(4,5,'STF-CSE-01','Prof. Anil Gupta','cse_dept@campusclear.edu','9876543213',4,'HOD - CSE Department','2026-09-10 02:07:41'),(5,6,'STF-EXM-01','Dr. Meena Reddy','exam@campusclear.edu','9876543214',7,'Controller of Examinations','2026-09-10 02:07:41');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `roll_number` varchar(30) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `batch` varchar(20) NOT NULL,
  `semester` int(11) DEFAULT 1,
  `academic_year` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `roll_number` (`roll_number`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (4,10,'TU6241103111002','AJAY N','tu6241103111002@student.edu','9841000000',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:58'),(5,11,'TU6241103111003','AKILAN R','tu6241103111003@student.edu','9841000137',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:58'),(6,12,'TU6241103111004','AKULA HEMANTH KUMAR','tu6241103111004@student.edu','9841000274',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:58'),(7,13,'TU6241103111005','AMUL VIZHI P','tu6241103111005@student.edu','9841000411',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:58'),(8,14,'TU6241103111006','ANANDARAJ T','tu6241103111006@student.edu','9841000548',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:58'),(9,15,'TU6241103111009','ARIVUSELVAN S','tu6241103111009@student.edu','9841000685',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:58'),(10,16,'TU6241103111010','ASHIP ALI A','tu6241103111010@student.edu','9841000822',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:58'),(11,17,'TU6241103111017','BANDI HEMANTH KUMAR','tu6241103111017@student.edu','9841000959',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:58'),(12,18,'TU6241103111020','BEZAWADA ANJANA','tu6241103111020@student.edu','9841001096',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(13,19,'TU6241103111021','BHAVANA R','tu6241103111021@student.edu','9841001233',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(14,20,'TU6241103111024','BOJARAJAN S','tu6241103111024@student.edu','9841001370',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(15,21,'TU6241103111026','BOMMINENI MOHAN KRISHNA','tu6241103111026@student.edu','9841001507',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(16,22,'TU6241103111030','C THEJAVARSHINI','tu6241103111030@student.edu','9841001644',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(17,23,'TU6241103111034','DESAM RITHIKA REDDY','tu6241103111034@student.edu','9841001781',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(18,24,'TU6241103111035','DHANALAKSHMI K','tu6241103111035@student.edu','9841001918',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(19,25,'TU6241103111038','DHIVYA S','tu6241103111038@student.edu','9841002055',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(20,26,'TU6241103111040','DONTHIREDDY VENKATA TEJENDRA REDDY','tu6241103111040@student.edu','9841002192',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(21,27,'TU6241103111042','DUVVURU SRUJAN KUMAR REDDY','tu6241103111042@student.edu','9841002329',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(22,28,'TU6241103111043','ELANGOVAN M','tu6241103111043@student.edu','9841002466',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(23,29,'TU6241103111051','GOPIKA','tu6241103111051@student.edu','9841002603',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(24,30,'TU6241103111052','GOWDA ANITHA','tu6241103111052@student.edu','9841002740',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(25,31,'TU6241103111053','GOWTHAM S','tu6241103111053@student.edu','9841002877',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(26,32,'TU6241103111057','HARIRAJAN K S','tu6241103111057@student.edu','9841003014',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(27,33,'TU6241103111058','HEMANATH J','tu6241103111058@student.edu','9841003151',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(28,34,'TU6241103111059','IYYANAR R','tu6241103111059@student.edu','9841003288',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(29,35,'TU6241103111060','JUVVALAGUNTA MOURYA HARSHA VARDHAN','tu6241103111060@student.edu','9841003425',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(30,36,'TU6241103111061','KALIKIRI NAVANTH REDDY','tu6241103111061@student.edu','9841003562',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(31,37,'TU6241103111073','KONATHALAPALLI VENKATA GNANATEJA','tu6241103111073@student.edu','9841003699',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(32,38,'TU6241103111078','KUMMARA SIVABANU','tu6241103111078@student.edu','9841003836',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(33,39,'TU6241103111085','MAMILLAPALLI ASHRITH CHOWDARY','tu6241103111085@student.edu','9841003973',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(34,40,'TU6241103111086','MANDATI NAVANEETH','tu6241103111086@student.edu','9841004110',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(35,41,'TU6241103111088','MANNERU HARINATH','tu6241103111088@student.edu','9841004247',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(36,42,'TU6241103111093','MARZEENA R G','tu6241103111093@student.edu','9841004384',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(37,43,'TU6241103111100','MUDI KAVYA','tu6241103111100@student.edu','9841004521',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(38,44,'TU6241103111101','MUKKELLA RAVITEJA','tu6241103111101@student.edu','9841004658',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(39,45,'TU6241103111103','NAKKANI VENKATA SAI TARUN','tu6241103111103@student.edu','9841004795',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(40,46,'TU6241103111105','NIRMAL KUMAR S','tu6241103111105@student.edu','9841004932',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(41,47,'TU6241103111109','P USHA SREE','tu6241103111109@student.edu','9841005069',4,'2024-2028',4,'2025-2026','2026-09-10 02:36:59'),(42,48,'TU6241103111116','PAWAR BAVESH KUMAR','tu6241103111116@student.edu','9841005206',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(43,49,'TU6241103111119','PITTA SAI SUNANDH KUMAR','tu6241103111119@student.edu','9841005343',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(44,50,'TU6241103111123','RAGAVI V','tu6241103111123@student.edu','9841005480',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(45,51,'TU6241103111124','RAGUNATHAN S','tu6241103111124@student.edu','9841005617',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(46,52,'TU6241103111126','RANJAN N','tu6241103111126@student.edu','9841005754',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(47,53,'TU6241103111128','RAVELLA VENKATA NAGA BAJI PAVAN KUMAR','tu6241103111128@student.edu','9841005891',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(48,54,'TU6241103111134','SAMRAJ R','tu6241103111134@student.edu','9841006028',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(49,55,'TU6241103111135','SANTHA PRAKASH E','tu6241103111135@student.edu','9841006165',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(50,56,'TU6241103111138','SASMITHA SREE B','tu6241103111138@student.edu','9841006302',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(51,57,'TU6241103111141','SHAIK KHALEELBASHA','tu6241103111141@student.edu','9841006439',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(52,58,'TU6241103111146','SIVASANKAR G','tu6241103111146@student.edu','9841006576',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(53,59,'TU6241103111149','SUSINDHAR S','tu6241103111149@student.edu','9841006713',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(54,60,'TU6241103111152','THALASILA NANDINI','tu6241103111152@student.edu','9841006850',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(55,61,'TU6241103111154','THILAGA P','tu6241103111154@student.edu','9841006987',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(56,62,'TU6241103111163','VARTHA SARAVANA','tu6241103111163@student.edu','9841007124',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(57,63,'TU6241103111166','VEMULA KULAVARDHAN','tu6241103111166@student.edu','9841007261',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(58,64,'TU6241103111174','ANUSHKA S','tu6241103111174@student.edu','9841007398',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(59,65,'TU6241103111175','CHANDRAPRASAD K','tu6241103111175@student.edu','9841007535',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(60,66,'TU6241103111176','O G DEVARAJ','tu6241103111176@student.edu','9841007672',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(61,67,'TU6241103111179','DUGGISETTY KAMALESH','tu6241103111179@student.edu','9841007809',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(62,68,'TU6241103111181','NELLORE ADITHYA','tu6241103111181@student.edu','9841007946',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(63,69,'TU6241103111183','SAKTHI VISHAL I','tu6241103111183@student.edu','9841008083',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(64,70,'TU6241103111186','CHELLOJU MOKSHAGNYA','tu6241103111186@student.edu','9841008220',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00'),(65,71,'TU6241103111190','SREERAM B','tu6241103111190@student.edu','9841008357',4,'2024-2028',4,'2025-2026','2026-09-10 02:37:00');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','staff','student') NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2y$10$2iDReXX3h/gWEfSSvwaOE.XYe.50o0iTSGVHgsSmePr1rXVmUDqOK','admin@campusclear.edu','admin','active','2026-09-10 02:07:41','2026-09-10 02:22:06'),(2,'staff_lib','$2y$10$KZOy7GvMXSB3dHJrIeijOepoeygJp.tF/9HvRl3ivQ/3eawzXaiqi','library@campusclear.edu','staff','active','2026-09-10 02:07:41','2026-09-10 02:22:06'),(3,'staff_acc','$2y$10$KZOy7GvMXSB3dHJrIeijOepoeygJp.tF/9HvRl3ivQ/3eawzXaiqi','accounts@campusclear.edu','staff','active','2026-09-10 02:07:41','2026-09-10 02:22:06'),(4,'staff_hst','$2y$10$KZOy7GvMXSB3dHJrIeijOepoeygJp.tF/9HvRl3ivQ/3eawzXaiqi','hostel@campusclear.edu','staff','active','2026-09-10 02:07:41','2026-09-10 02:22:06'),(5,'staff_cse','$2y$10$KZOy7GvMXSB3dHJrIeijOepoeygJp.tF/9HvRl3ivQ/3eawzXaiqi','cse_dept@campusclear.edu','staff','active','2026-09-10 02:07:41','2026-09-10 02:22:06'),(6,'staff_exm','$2y$10$KZOy7GvMXSB3dHJrIeijOepoeygJp.tF/9HvRl3ivQ/3eawzXaiqi','exam@campusclear.edu','staff','active','2026-09-10 02:07:41','2026-09-10 02:22:06'),(10,'TU6241103111002','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111002@student.edu','student','active','2026-09-10 02:36:58','2026-09-10 02:36:58'),(11,'TU6241103111003','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111003@student.edu','student','active','2026-09-10 02:36:58','2026-09-10 02:36:58'),(12,'TU6241103111004','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111004@student.edu','student','active','2026-09-10 02:36:58','2026-09-10 02:36:58'),(13,'TU6241103111005','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111005@student.edu','student','active','2026-09-10 02:36:58','2026-09-10 02:36:58'),(14,'TU6241103111006','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111006@student.edu','student','active','2026-09-10 02:36:58','2026-09-10 02:36:58'),(15,'TU6241103111009','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111009@student.edu','student','active','2026-09-10 02:36:58','2026-09-10 02:36:58'),(16,'TU6241103111010','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111010@student.edu','student','active','2026-09-10 02:36:58','2026-09-10 02:36:58'),(17,'TU6241103111017','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111017@student.edu','student','active','2026-09-10 02:36:58','2026-09-10 02:36:58'),(18,'TU6241103111020','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111020@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(19,'TU6241103111021','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111021@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(20,'TU6241103111024','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111024@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(21,'TU6241103111026','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111026@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(22,'TU6241103111030','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111030@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(23,'TU6241103111034','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111034@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(24,'TU6241103111035','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111035@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(25,'TU6241103111038','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111038@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(26,'TU6241103111040','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111040@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(27,'TU6241103111042','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111042@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(28,'TU6241103111043','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111043@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(29,'TU6241103111051','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111051@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(30,'TU6241103111052','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111052@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(31,'TU6241103111053','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111053@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(32,'TU6241103111057','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111057@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(33,'TU6241103111058','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111058@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(34,'TU6241103111059','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111059@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(35,'TU6241103111060','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111060@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(36,'TU6241103111061','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111061@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(37,'TU6241103111073','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111073@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(38,'TU6241103111078','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111078@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(39,'TU6241103111085','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111085@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(40,'TU6241103111086','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111086@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(41,'TU6241103111088','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111088@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(42,'TU6241103111093','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111093@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(43,'TU6241103111100','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111100@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(44,'TU6241103111101','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111101@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(45,'TU6241103111103','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111103@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(46,'TU6241103111105','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111105@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(47,'TU6241103111109','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111109@student.edu','student','active','2026-09-10 02:36:59','2026-09-10 02:36:59'),(48,'TU6241103111116','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111116@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(49,'TU6241103111119','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111119@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(50,'TU6241103111123','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111123@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(51,'TU6241103111124','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111124@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(52,'TU6241103111126','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111126@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(53,'TU6241103111128','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111128@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(54,'TU6241103111134','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111134@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(55,'TU6241103111135','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111135@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(56,'TU6241103111138','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111138@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(57,'TU6241103111141','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111141@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(58,'TU6241103111146','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111146@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(59,'TU6241103111149','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111149@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(60,'TU6241103111152','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111152@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(61,'TU6241103111154','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111154@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(62,'TU6241103111163','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111163@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(63,'TU6241103111166','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111166@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(64,'TU6241103111174','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111174@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(65,'TU6241103111175','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111175@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(66,'TU6241103111176','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111176@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(67,'TU6241103111179','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111179@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(68,'TU6241103111181','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111181@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(69,'TU6241103111183','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111183@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(70,'TU6241103111186','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111186@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00'),(71,'TU6241103111190','$2y$10$ZRKvqfROSLP8uz3rxFNKpe72G8ssIK6uIKXLfPzu7G1ILz9SzGFmK','tu6241103111190@student.edu','student','active','2026-09-10 02:37:00','2026-09-10 02:37:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'campusclear_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-10 11:03:33
