/* Replace with your SQL commands */
CREATE TABLE `withdrawInfo` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `sWalletAddress` varchar(1000) NOT NULL DEFAULT '',
    `nAccumAmount` int(11) unsigned NOT NULL DEFAULT 0,
    `nCommitAmount` int(11) unsigned NOT NULL DEFAULT 0,
    `nRatio` int(11) NOT NULL DEFAULT 0,
    `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
