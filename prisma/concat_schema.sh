CUR_DIR=`dirname ${0}`
cat ${CUR_DIR}/config.prisma ${CUR_DIR}/../src/models/*.prisma > ${CUR_DIR}/schema.prisma
