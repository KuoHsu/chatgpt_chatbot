
--
-- Table structure for table `group_info`
--

DROP TABLE IF EXISTS `group_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `group_info` (
  `group_index` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` varchar(50) NOT NULL,
  `from` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_croatian_ci DEFAULT NULL,
  `groupname` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`group_index`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `q_type`
--

DROP TABLE IF EXISTS `q_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `q_type` (
  `type_id` int(11) NOT NULL,
  `description` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `user_info`
--

DROP TABLE IF EXISTS `user_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_info` (
  `user_index` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` char(64) NOT NULL,
  `from` varchar(14) NOT NULL,
  `username` varchar(50) NOT NULL,
  PRIMARY KEY (`user_index`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `qa_info`
--

DROP TABLE IF EXISTS `qa_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `qa_info` (
  `qa_index` int(11) NOT NULL AUTO_INCREMENT,
  `user_index` int(11) NOT NULL,
  `group_index` int(11) DEFAULT NULL,
  `request` varchar(1000) NOT NULL,
  `response` varchar(1000) NOT NULL,
  `datetime` datetime NOT NULL,
  `type` int(11) NOT NULL,
  PRIMARY KEY (`qa_index`),
  KEY `FK_qa_info_group_info` (`group_index`),
  KEY `FK_qa_info_user_info` (`user_index`),
  KEY `qa_info_ibfk_3` (`type`),
  CONSTRAINT `FK_qa_info_user_info` FOREIGN KEY (`user_index`) REFERENCES `user_info` (`user_index`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `qa_info_ibfk_3` FOREIGN KEY (`type`) REFERENCES `q_type` (`type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Dump completed on 2023-01-20  3:33:42
