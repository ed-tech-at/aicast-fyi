# creation

npx sv create sveltekit

typescript
vitest and sveltekit-adapter

node adapter

package manager
npm

# RETURN Server
/docker/return/deploy-github.sh  ed-tech-at/aicast-fyi main

# Database

```
npm install prisma --save-dev
npm install @prisma/client

npx prisma init
```

## User Creation
```
-- Create user
CREATE USER aicast_fyi_main WITH PASSWORD 'PASSWORT_NOGIT';

-- Create database with user as owner
CREATE DATABASE aicast_fyi_main OWNER aicast_fyi_main;

-- Set privileges
GRANT ALL PRIVILEGES ON DATABASE aicast_fyi_main TO aicast_fyi_main;
```

and local database for migrations

```
-- Create database with user as owner
CREATE DATABASE aicast_fyi_migrations OWNER aicast_fyi_main;

-- Set privileges
GRANT ALL PRIVILEGES ON DATABASE aicast_fyi_migrations TO aicast_fyi_main;
```


## Submit database changes
```
npx prisma migrate dev --name init
npx prisma generate
```

und danach wenn alles geht:
```
npx prisma migrate status
npx prisma migrate deploy
```