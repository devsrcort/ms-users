/* Replace with your SQL commands */
ALTER TABLE `withdrawInfo` ADD 
(
    `nInitBalance` int(11) unsigned NOT NULL DEFAULT 0,
    `nLimitAmount` int(11) unsigned NOT NULL DEFAULT 0
)