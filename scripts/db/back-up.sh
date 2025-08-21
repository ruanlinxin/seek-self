# 选择其中一个执行
docker exec seek-self-mysql mysqldump -u root -proot123456 seek_self > backup.sql

# 或者
docker exec seek-self-mysql mysqldump -u root -proot123456 --no-tablespaces --skip-lock-tables seek_self > backup.sql