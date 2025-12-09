-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 04, 2025 at 06:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `24hotel`
--

-- --------------------------------------------------------

--
-- Table structure for table `akun`
--
-- Error reading structure for table 24hotel.akun: #1932 - Table '24hotel.akun' doesn't exist in engine
-- Error reading data for table 24hotel.akun: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`akun`' at line 1

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--
-- Error reading structure for table 24hotel.booking: #1932 - Table '24hotel.booking' doesn't exist in engine
-- Error reading data for table 24hotel.booking: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`booking`' at line 1

-- --------------------------------------------------------

--
-- Table structure for table `booking_and_service`
--
-- Error reading structure for table 24hotel.booking_and_service: #1932 - Table '24hotel.booking_and_service' doesn't exist in engine
-- Error reading data for table 24hotel.booking_and_service: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`booking_and_service`' at line 1

-- --------------------------------------------------------

--
-- Table structure for table `booking_kamar`
--
-- Error reading structure for table 24hotel.booking_kamar: #1932 - Table '24hotel.booking_kamar' doesn't exist in engine
-- Error reading data for table 24hotel.booking_kamar: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`booking_kamar`' at line 1

-- --------------------------------------------------------

--
-- Stand-in structure for view `detail_booking`
-- (See below for the actual view)
--
CREATE TABLE `detail_booking` (
);

-- --------------------------------------------------------

--
-- Table structure for table `extra_service`
--
-- Error reading structure for table 24hotel.extra_service: #1932 - Table '24hotel.extra_service' doesn't exist in engine
-- Error reading data for table 24hotel.extra_service: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`extra_service`' at line 1

-- --------------------------------------------------------

--
-- Table structure for table `kamar`
--
-- Error reading structure for table 24hotel.kamar: #1932 - Table '24hotel.kamar' doesn't exist in engine
-- Error reading data for table 24hotel.kamar: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`kamar`' at line 1

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--
-- Error reading structure for table 24hotel.pembayaran: #1932 - Table '24hotel.pembayaran' doesn't exist in engine
-- Error reading data for table 24hotel.pembayaran: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`pembayaran`' at line 1

-- --------------------------------------------------------

--
-- Table structure for table `tamu`
--
-- Error reading structure for table 24hotel.tamu: #1932 - Table '24hotel.tamu' doesn't exist in engine
-- Error reading data for table 24hotel.tamu: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`tamu`' at line 1

-- --------------------------------------------------------

--
-- Table structure for table `tamu_tambahan`
--
-- Error reading structure for table 24hotel.tamu_tambahan: #1932 - Table '24hotel.tamu_tambahan' doesn't exist in engine
-- Error reading data for table 24hotel.tamu_tambahan: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`tamu_tambahan`' at line 1

-- --------------------------------------------------------

--
-- Table structure for table `tipe_kamar`
--
-- Error reading structure for table 24hotel.tipe_kamar: #1932 - Table '24hotel.tipe_kamar' doesn't exist in engine
-- Error reading data for table 24hotel.tipe_kamar: #1064 - You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'FROM `24hotel`.`tipe_kamar`' at line 1

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_total_harga`
-- (See below for the actual view)
--
CREATE TABLE `view_total_harga` (
);

-- --------------------------------------------------------

--
-- Structure for view `detail_booking`
--
DROP TABLE IF EXISTS `detail_booking`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `detail_booking`  AS SELECT `t`.`nik_tamu` AS `nik_tamu`, `t`.`nama_tamu` AS `nama_tamu`, `b`.`id_booking` AS `id_booking`, `b`.`tgl_booking` AS `tgl_booking`, `bk`.`id_booking_kamar` AS `id_booking_kamar`, `bk`.`tgl_check_in` AS `tgl_check_in_kamar`, `bk`.`tgl_check_out` AS `tgl_check_out_kamar`, `bk`.`tipe` AS `tipe_kamar`, `bk`.`no_kamar` AS `no_kamar`, ifnull(`bk`.`total_harga`,0) AS `total_harga_kamar`, `bs`.`id_booking_service` AS `id_booking_service`, `bs`.`jenis_service` AS `jenis_service`, `bs`.`banyak_service` AS `banyak_service`, ifnull(`bs`.`total_harga`,0) AS `total_harga_service`, `vth`.`total_harga_kamar`+ `vth`.`total_harga_service` AS `total_pembayaran`, `p`.`total_harga` AS `total_dibayar`, `p`.`tanggal_pembayaran` AS `tanggal_pembayaran`, `p`.`status_pembayaran` AS `status_pembayaran` FROM (((((`tamu` `t` join `booking` `b` on(`t`.`nik_tamu` = `b`.`nik_tamu`)) left join `booking_kamar` `bk` on(`b`.`id_booking` = `bk`.`id_booking`)) left join `booking_and_service` `bs` on(`b`.`id_booking` = `bs`.`id_booking`)) left join `view_total_harga` `vth` on(`b`.`id_booking` = `vth`.`id_booking`)) left join `pembayaran` `p` on(`b`.`id_booking` = `p`.`id_booking`)) ;

-- --------------------------------------------------------

--
-- Structure for view `view_total_harga`
--
DROP TABLE IF EXISTS `view_total_harga`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_total_harga`  AS SELECT `b`.`id_booking` AS `id_booking`, coalesce(`b`.`nik_tamu`,`s`.`nik`) AS `nik`, coalesce(sum(`bk`.`total_harga`),0) AS `total_harga_kamar`, coalesce(sum(`s`.`total_harga`),0) AS `total_harga_service`, coalesce(sum(`bk`.`total_harga`),0) + coalesce(sum(`s`.`total_harga`),0) AS `total_keseluruhan` FROM ((`booking` `b` left join `booking_kamar` `bk` on(`b`.`id_booking` = `bk`.`id_booking`)) left join `booking_and_service` `s` on(`b`.`id_booking` = `s`.`id_booking`)) GROUP BY `b`.`id_booking`, coalesce(`b`.`nik_tamu`,`s`.`nik`) ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
