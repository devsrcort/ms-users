/* Replace with your SQL commands */
CREATE TABLE `ddaytime` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(36) NOT NULL DEFAULT '',
    `destTime` datetime NOT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;