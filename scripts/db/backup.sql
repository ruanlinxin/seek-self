-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: seek_self
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `app`
--

DROP TABLE IF EXISTS `app`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app` (
  `id` varchar(21) NOT NULL,
  `created_by` varchar(21) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` varchar(21) DEFAULT NULL COMMENT '更新人ID',
  `deleted_by` varchar(21) DEFAULT NULL COMMENT '删除人ID',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `deleted_at` datetime(6) DEFAULT NULL COMMENT '删除时间',
  `group` varchar(50) NOT NULL COMMENT '分组',
  `name` varchar(100) NOT NULL COMMENT '应用名',
  `description` varchar(255) DEFAULT NULL COMMENT '介绍',
  `icon` varchar(255) DEFAULT NULL COMMENT '图标',
  `status` int NOT NULL DEFAULT '1' COMMENT '状态 1-启用 0-禁用',
  `order_no` int NOT NULL DEFAULT '0' COMMENT '排序',
  `version` varchar(20) DEFAULT NULL COMMENT '版本号',
  `entry_url` varchar(255) DEFAULT NULL COMMENT '入口地址',
  `is_system` tinyint NOT NULL DEFAULT '0' COMMENT '是否系统应用',
  `app_extend` json DEFAULT NULL COMMENT '扩展信息',
  `app_type` varchar(50) DEFAULT NULL COMMENT '应用类型',
  `component_key` varchar(1000) DEFAULT NULL COMMENT '组件key',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app`
--

LOCK TABLES `app` WRITE;
/*!40000 ALTER TABLE `app` DISABLE KEYS */;
INSERT INTO `app` VALUES ('IYBQqG6ggtl-eqdKa5WgN','GCYYTuBDShmdwzQGMsrZG','GCYYTuBDShmdwzQGMsrZG',NULL,'2025-07-24 11:10:04.629644','2025-08-14 09:03:04.000000',NULL,'system','数据字典','无','',1,-1,'1','',1,'{\"window\": {\"multi\": false, \"width\": 800, \"height\": 500, \"resizable\": true, \"fullScreen\": false, \"fullScreenAvailable\": true}}','native',NULL),('qqbNq_MqDsr3X5VyoVZ5j','GCYYTuBDShmdwzQGMsrZG','GCYYTuBDShmdwzQGMsrZG',NULL,'2025-07-25 17:15:11.855594','2025-07-25 17:16:07.000000',NULL,'other','随机字符','','',1,0,'1','',0,'{\"window\": {\"multi\": true, \"width\": 800, \"height\": 500, \"resizable\": true, \"fullScreen\": false, \"fullScreenAvailable\": true}}','native',NULL),('SLF99ije73Rau5BT224zV','GCYYTuBDShmdwzQGMsrZG','GCYYTuBDShmdwzQGMsrZG',NULL,'2025-07-24 10:01:44.583913','2025-08-14 09:05:49.502650',NULL,'system','应用管理','无','',1,-1,'1','',1,'{\"a\": 1, \"window\": {\"multi\": false, \"width\": 800, \"height\": 500, \"resizable\": true, \"fullScreen\": false, \"fullScreenAvailable\": true}}','native','appManage'),('VqeHOGTfTfhfwKxmtLL76','GCYYTuBDShmdwzQGMsrZG','GCYYTuBDShmdwzQGMsrZG',NULL,'2025-07-30 13:32:15.788648','2025-08-15 03:39:59.000000',NULL,'other','端对端聊天','','',1,0,'1','',0,'{\"window\": {\"multi\": true, \"width\": 800, \"height\": 500, \"resizable\": true, \"fullScreen\": true, \"fullScreenAvailable\": true}}','native','p2p');
/*!40000 ALTER TABLE `app` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bing_images`
--

DROP TABLE IF EXISTS `bing_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bing_images` (
  `id` varchar(21) NOT NULL,
  `created_by` varchar(21) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` varchar(21) DEFAULT NULL COMMENT '更新人ID',
  `deleted_by` varchar(21) DEFAULT NULL COMMENT '删除人ID',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `deleted_at` datetime(6) DEFAULT NULL COMMENT '删除时间',
  `date` date NOT NULL,
  `title` varchar(500) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `full_url` varchar(1000) NOT NULL,
  `copyright` varchar(500) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `IDX_bing_images_date_region` (`date`,`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bing_images`
--

LOCK TABLES `bing_images` WRITE;
/*!40000 ALTER TABLE `bing_images` DISABLE KEYS */;
INSERT INTO `bing_images` VALUES ('0NxKF0zTVxXXFqDUXMek2',NULL,NULL,NULL,'2025-08-14 08:58:32.476594','2025-08-14 08:58:32.476594',NULL,'2025-08-14','从山顶俯瞰','/th?id=OHR.PizNairPeak_ZH-CN8209144138_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','https://www.bing.com/th?id=OHR.PizNairPeak_ZH-CN8209144138_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','皮兹奈尔山缆车站, 格劳宾登州, 瑞士 (© Roberto Moiola/Alamy)','zh-CN',''),('ekhk8T15kEdDr5Udjg8T0',NULL,NULL,NULL,'2025-08-18 02:38:24.564805','2025-08-18 02:38:24.564805',NULL,'2025-08-18','溪流入梦','/th?id=OHR.AvalancheLake_ZH-CN1442576083_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','https://www.bing.com/th?id=OHR.AvalancheLake_ZH-CN1442576083_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','雪崩湖步道，阿迪朗达克高峰区，纽约州，美国 (© Posnov/Getty Images)','zh-CN',''),('mlcK6Cf8CLzXXrkgBvFL1',NULL,NULL,NULL,'2025-08-16 04:40:35.667561','2025-08-16 04:40:35.667561',NULL,'2025-08-16','成为改变的一“蜂”','/th?id=OHR.ColorfulBeehives_ZH-CN0180195770_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','https://www.bing.com/th?id=OHR.ColorfulBeehives_ZH-CN0180195770_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','色彩斑斓的蜂巢, 意大利 (© Roberto Caucino/Shutterstock)','zh-CN',''),('oNMeXBMV74k96F345GrAP',NULL,NULL,NULL,'2025-08-08 07:25:38.559461','2025-08-08 07:25:38.559461',NULL,'2025-08-08','奔流不息，为你为我','/th?id=OHR.IguazuArgentina_ZH-CN4457051931_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','https://www.bing.com/th?id=OHR.IguazuArgentina_ZH-CN4457051931_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','伊瓜苏瀑布的三火枪瀑布, 阿根廷 (© Mark Meredith/Getty Images)','zh-CN',''),('spdV4OyIocyM3JCblepis',NULL,NULL,NULL,'2025-08-19 02:01:28.575496','2025-08-19 02:01:28.575496',NULL,'2025-08-19','随海而流的岩石！','/th?id=OHR.GipuzcoaSummer_ZH-CN1926924422_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','https://www.bing.com/th?id=OHR.GipuzcoaSummer_ZH-CN1926924422_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','祖马亚的复理层，巴斯克地区，西班牙 (© Eloi_Omella/Getty Images)','zh-CN',''),('t6b9SP3zX_WbhCIb7Qw9V',NULL,NULL,NULL,'2025-08-15 03:39:24.075948','2025-08-15 03:39:24.075948',NULL,'2025-08-15','水下翱翔','/th?id=OHR.SpottedEagleRay_ZH-CN9894613260_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','https://www.bing.com/th?id=OHR.SpottedEagleRay_ZH-CN9894613260_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp','斑点鹞鲼，圣克里斯托瓦尔岛‌，‌加拉帕戈斯群岛，厄瓜多尔 (© Tui De Roy/Minden Pictures)','zh-CN','');
/*!40000 ALTER TABLE `bing_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dict`
--

DROP TABLE IF EXISTS `dict`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dict` (
  `id` varchar(21) NOT NULL,
  `created_by` varchar(21) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` varchar(21) DEFAULT NULL COMMENT '更新人ID',
  `deleted_by` varchar(21) DEFAULT NULL COMMENT '删除人ID',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `deleted_at` datetime(6) DEFAULT NULL COMMENT '删除时间',
  `key` varchar(100) NOT NULL COMMENT '字典键',
  `value` varchar(255) NOT NULL COMMENT '字典值',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `type` varchar(50) NOT NULL COMMENT '字典类型',
  `enabled` tinyint NOT NULL DEFAULT '0' COMMENT '是否启用',
  `order_no` int NOT NULL DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_61ca69cdd0fc6b67baa25c518e` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dict`
--

LOCK TABLES `dict` WRITE;
/*!40000 ALTER TABLE `dict` DISABLE KEYS */;
INSERT INTO `dict` VALUES ('09kYfbVqfWVbbBJrG2IvM',NULL,NULL,NULL,'2025-07-30 14:28:57.610994','2025-07-30 14:28:57.610994',NULL,'应用组件类型','appComponentType','','dict',1,0),('34dXPbMDZ7Q3IinEWUjTl',NULL,NULL,NULL,'2025-07-24 15:34:24.625401','2025-07-24 15:34:24.625401',NULL,'女','2','','gender',1,0),('f5QKs4a0PEg0bypUp2kyw',NULL,NULL,NULL,'2025-07-24 15:34:12.792693','2025-07-24 15:34:12.792693',NULL,'未知','0','','gender',1,0),('lrPsJtNQyVGzYmrc5OYDJ',NULL,NULL,NULL,'2025-07-30 14:30:20.545552','2025-07-30 14:30:20.545552',NULL,'单文件原生','sfcNative','','appComponentType',1,0),('MYPC0VLAk4RGWPdbH8Fqf',NULL,NULL,NULL,'2025-07-30 14:29:29.952961','2025-07-30 14:29:29.952961',NULL,'原生','native','','appComponentType',1,0),('nMfhaM6eZK9KpMv14-np2',NULL,NULL,NULL,'2025-07-24 16:35:30.529199','2025-07-24 16:35:30.529199',NULL,'系统应用','system','','appGroup',1,0),('root',NULL,NULL,NULL,'2025-07-24 11:44:45.293018','2025-07-24 14:24:15.466332',NULL,'数据字典','dict','基础的字典类型请勿操作','dict',1,0),('sws3K91yWUwGef3Bx7pVs',NULL,NULL,NULL,'2025-07-24 14:39:02.127258','2025-07-24 14:39:03.000000','2025-07-24 14:39:03.000000','1111111','1','','dict',1,0),('TdJB0qjNIjmBQ5CnYUgws',NULL,NULL,NULL,'2025-07-24 15:34:19.375619','2025-07-24 15:34:19.375619',NULL,'男','1','','gender',1,0),('vBKIN7JvijtAIN3wlM4Wq',NULL,NULL,NULL,'2025-07-24 16:35:12.306985','2025-07-24 16:35:12.306985',NULL,'应用分组','appGroup','','dict',1,0),('x1sU0RgjgZqFi4CcVJgHC',NULL,NULL,NULL,'2025-07-24 14:28:20.410311','2025-07-24 14:32:22.000000',NULL,'性别','gender','','dict',1,2),('XaX6q04AXXUIv5hlT5oZi',NULL,NULL,NULL,'2025-07-25 17:10:23.499988','2025-07-25 17:10:23.499988',NULL,'其他','other','','appGroup',1,1);
/*!40000 ALTER TABLE `dict` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `env`
--

DROP TABLE IF EXISTS `env`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `env` (
  `id` varchar(21) DEFAULT NULL,
  `created_by` varchar(21) DEFAULT NULL,
  `updated_by` varchar(21) DEFAULT NULL,
  `deleted_by` varchar(21) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `key` varchar(100) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `env`
--

LOCK TABLES `env` WRITE;
/*!40000 ALTER TABLE `env` DISABLE KEYS */;
/*!40000 ALTER TABLE `env` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(21) NOT NULL,
  `created_by` varchar(21) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` varchar(21) DEFAULT NULL COMMENT '更新人ID',
  `deleted_by` varchar(21) DEFAULT NULL COMMENT '删除人ID',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `deleted_at` datetime(6) DEFAULT NULL COMMENT '删除时间',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('GCYYTuBDShmdwzQGMsrZG',NULL,NULL,NULL,'2025-07-24 10:01:04.865584','2025-07-24 10:01:04.865584',NULL,'2818609296@qq.com','$2b$10$ehZ83MbMJVepGU1QAyN2yuDIynQYqEkgtye7TYJZev/HCH3t.P94m');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_app_relation`
--

DROP TABLE IF EXISTS `user_app_relation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_app_relation` (
  `id` varchar(21) NOT NULL,
  `created_by` varchar(21) DEFAULT NULL COMMENT '创建人ID',
  `updated_by` varchar(21) DEFAULT NULL COMMENT '更新人ID',
  `deleted_by` varchar(21) DEFAULT NULL COMMENT '删除人ID',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `deleted_at` datetime(6) DEFAULT NULL COMMENT '删除时间',
  `user_id` varchar(21) NOT NULL COMMENT '用户ID',
  `app_id` varchar(21) NOT NULL COMMENT '应用ID',
  `used_at` datetime DEFAULT NULL COMMENT '最近使用时间',
  `favorite_at` datetime DEFAULT NULL COMMENT '收藏时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_app_relation`
--

LOCK TABLES `user_app_relation` WRITE;
/*!40000 ALTER TABLE `user_app_relation` DISABLE KEYS */;
INSERT INTO `user_app_relation` VALUES ('_ZuQpjTpbh-OvledgZMr-',NULL,NULL,NULL,'2025-07-30 13:32:24.254977','2025-08-15 08:18:58.000000',NULL,'GCYYTuBDShmdwzQGMsrZG','VqeHOGTfTfhfwKxmtLL76','2025-08-15 16:18:59',NULL),('e0E9ladDuuYX7tls-oXZa',NULL,NULL,NULL,'2025-07-25 16:28:58.491185','2025-08-15 03:39:52.000000',NULL,'GCYYTuBDShmdwzQGMsrZG','SLF99ije73Rau5BT224zV','2025-08-15 11:39:52',NULL),('mb2jLsZbQiieiWpnQluAD',NULL,NULL,NULL,'2025-07-25 15:48:31.623491','2025-07-30 15:24:37.000000',NULL,'GCYYTuBDShmdwzQGMsrZG','IYBQqG6ggtl-eqdKa5WgN','2025-07-30 15:24:37','2025-07-25 17:02:05'),('svkwJn6xaJ2Zqs-5xMzUt',NULL,NULL,NULL,'2025-07-25 17:15:26.930723','2025-07-25 17:35:50.000000',NULL,'GCYYTuBDShmdwzQGMsrZG','qqbNq_MqDsr3X5VyoVZ5j','2025-07-25 17:35:50',NULL);
/*!40000 ALTER TABLE `user_app_relation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profile`
--

DROP TABLE IF EXISTS `user_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile` (
  `user_id` varchar(21) NOT NULL,
  `nickname` varchar(50) NOT NULL COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `gender` tinyint NOT NULL DEFAULT '0' COMMENT '性别 0-未知 1-男 2-女',
  `bio` varchar(255) DEFAULT NULL COMMENT '简介',
  `birth` date DEFAULT NULL COMMENT '生日',
  `userId` varchar(21) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `REL_51cb79b5555effaf7d69ba1cff` (`userId`),
  CONSTRAINT `FK_51cb79b5555effaf7d69ba1cff9` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profile`
--

LOCK TABLES `user_profile` WRITE;
/*!40000 ALTER TABLE `user_profile` DISABLE KEYS */;
INSERT INTO `user_profile` VALUES ('GCYYTuBDShmdwzQGMsrZG','用户_f346e566',NULL,0,NULL,'1996-06-12',NULL);
/*!40000 ALTER TABLE `user_profile` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-20  1:54:21
