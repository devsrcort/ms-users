/* Replace with your SQL commands */
CREATE TABLE `withdraw` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `sEmail` varchar(1000) NOT NULL DEFAULT '',
    `dStartDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `dEndDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `sStrideTag` varchar(100) NOT NULL DEFAULT 'Month',
    `nStride` int(11) NOT NULL DEFAULT 0,
    `nWithdrawRatioStide` int(11) NOT NULL DEFAULT 0,
    `nAccuTransferCount` int(11) unsigned NOT NULL DEFAULT 0,
    `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
