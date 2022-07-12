/* Replace with your SQL commands */
CREATE TABLE `txInfo` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `sWalletAddress` varchar(1000) NOT NULL DEFAULT '',
    `sFromAddress` varchar(1000) NOT NULL DEFAULT '',
    `sToAddr` varchar(1000) NOT NULL DEFAULT '',
    `nAmount` int(11) unsigned NOT NULL DEFAULT 0,
    `sTxHash` varchar(1000) NOT NULL DEFAULT '',
    `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
