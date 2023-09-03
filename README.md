# 프론트 개발을 위한 로컬 서버 실행
0. docker가 설치되어 있어야 함
1. 백엔드 레포 클론 후
2. 루트 디렉토리에 .env 파일 생성 후 아래 내용 추가
```
DATABASE_URL="mysql://root:root@db/db"
```
3. 루트 디렉토리에서 아래 명령어 실행
```
docker-compose down --rmi local
docker-compose up -d
```
4. http://localhost:3000/docs 에서 api 문서 확인

# 백엔드 개발
## 개발용 서버 실행 방법
0. node(18버전 이상)와 npm이 설치되어 있어야 함
1. 루트 디렉토리에 .env 파일 생성 후 개발용 데이터베이스 정보 추가
```
DATABASE_URL="mysql://사용자:비밀번호@주소:포트/데이터베이스명"
```
2. 루트 디렉토리에서 아래 명령어 실행
```
npm install
npm run prisma
npm run dev
```

## 테스트 방법
0. 개발용 빌드 과정중 npm run prisma를 1회이상 실행해야 함
1. 루트 디렉토리에서 아래 명령어 실행
```
npm run test
```
2. 테스트 커버리지 확인
```
npm run test:coverage
```

## 배포 방법
main 브랜치에 push하면 자동으로 배포되도록 CD 설정할 예정

## 커밋 컨벤션
|Commit Type | Title | Description | Emoji |
|:---|:---|:---|:---|
|feat |	Features | A new feature | ✨|
|fix |	Bug Fixes | A bug Fix| 🐛|
|docs |	Documentation |	Documentation only changes	| 📚|
|style | Styles | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) | 💎|
|refactor |	Code Refactoring | A code change that neither fixes a bug nor adds a feature |📦|
|perf |	Performance  Improvements |	A code change that improves performance	|🚀|
|test |	Tests |	Adding missing tests or correcting existing tests	|🚨|
|build |	Builds |	Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)	|🛠|
|ci |	Continuous Integrations | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)	|⚙️|
|chore |	Chores |	Other changes that don't modify src or test files	|♻️|
|revert |	Reverts |	Reverts a previous commit	|🗑|

## api 명세서
[api 명세서](https://www.notion.so/2886b7282e35479cb30c857b9a61e02c?v=52f1977967af41b0b6617f46a69a91b1)

## 새로운 api 추가 방법
각 폴더에 이미 작성된 파일들을 참고하면서 아래 순서로 진행하는 것을 추천
1. (필요하다면) src/models 폴더에 새로운 모델 파일 추가
2. src/DTO 폴더에 새로운 DTO 작성
3. 해당 api를 사용하는 테스트를 test/integration 폴더에 작성
4. src/api 폴더에 새로운 api 작성, 새로운 api 파일을 만들었다면 src/api/index.ts에 등록
5. src/services 폴더에 새로운 service 작성

## 전체적인 백엔드 구조
1. ~ 서버 실행까지
    * src/config/index.ts에서 환경변수를 읽어오고, 없으면 디폴트 값으로 설정
    * src/loaders/index.ts에서 src/config/index.ts에서 읽어온 환경변수를 이용해 필요한 라이브러리들을 초기화하고 서버에 api를 등록
    * src/server.ts에서 서버를 생성하고 src/loaders/index.ts로 서버를 넘겨서 세팅
    * src/index.ts에서 src/server.ts에서 생성한 서버를 실행
2. api request 처리 과정
    * src/server.ts에서 생성한 서버는 src/api/index.ts에서 등록한 api를 사용
    * src/api/index.ts에서 등록한 api는 src/services 폴더에 있는 service를 사용
    * src/services 폴더에 있는 service는 src/models 폴더에 의해 생성된 prisma client를 사용
    * 위 과정에서 데이터들은 src/DTO 폴더에 있는 DTO를 통해 전달됨
