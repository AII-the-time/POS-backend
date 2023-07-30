# 프론트 개발을 위한 로컬 서버 실행
0. docker가 설치되어 있어야 함
1. 백엔드 레포 클론 후
2. .env 파일 생성 후 아래 내용 추가
```
DATABASE_URL="mysql://root:root@db/db"
```
3. 루트 디렉토리에서 아래 명령어 실행
```
docker rmi pos-backend-server
docker-compose up -d
```
